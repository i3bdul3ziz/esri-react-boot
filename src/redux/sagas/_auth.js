// Copyright 2019 Esri
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//     http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.​

import { call, put, takeLatest } from "redux-saga/effects";
import { types } from "../reducers/auth";
import {
  signIn,
  completeSignIn,
  signOut,
  restoreSession
} from "../../utils/session";

// WORKER //
function* startAuth(action) {
  try {
    //const user = yield call(signIn, action.payload);
    // console.log("checking the session...");
    let authInfos = yield call(restoreSession, action.payload.sessionId);

    if (!authInfos) {
      authInfos = yield call(signIn, action.payload);
    }

    // console.log("startAuth: ", authInfos);

    // Check if the authObj is undefined
    if (authInfos) {
      yield put({
        type: types.AUTH_SUCCESS,
        payload: authInfos
      });
    } else {
      // putting a fail call here just means that we didn't need to login
      yield put({ type: types.AUTH_FAIL });
    }
  } catch (e) {
    yield put({ type: types.AUTH_FAIL });
    console.error("SAGA ERROR: auth/startAuth, ", e);
  }
}

function* completeAuth(action) {
  try {
    const authInfos = yield call(completeSignIn, action.payload);

    // temp set to deliver over https on netlify
    authInfos.portal.allSSL = true;

    //console.log("COMPLETE Auth: ", authInfos);

    //yield call(saveSession, action.payload.sessionId);

    // Check if the authObj is undefined
    if (authInfos) {
      yield put({
        type: types.AUTH_SUCCESS,
        payload: authInfos
      });
    } else {
      // putting a fail call here just means that we didn't need to login
      yield put({ type: types.AUTH_FAIL });
    }
  } catch (e) {
    yield put({ type: types.AUTH_FAIL });
    console.error("SAGA ERROR: auth/startAuth, ", e);
  }
}

function* checkAuth(action) {
  try {
    let authInfos = yield call(restoreSession, action.payload.sessionId);

    // Check if the authObj is undefined
    if (authInfos) {
      yield put({
        type: types.AUTH_SUCCESS,
        payload: authInfos
      });
    } else {
      // putting a fail call here just means that we didn't need to login
      yield put({ type: types.AUTH_FAIL });
    }
  } catch (e) {
    yield put({ type: types.AUTH_FAIL });
    console.error("SAGA ERROR: auth/checkAuth, ", e);
  }
}

function* authLogout(action) {
  try {
    yield call(signOut, action.payload.sessionId);

    window.location.reload();
  } catch (e) {
    console.error("SAGA ERROR: auth/logout, ", e);
  }
}

// WATCHER //
export function* watchStartAPI() {
  yield takeLatest(types.AUTH_CHECK, checkAuth);
  yield takeLatest(types.AUTH_START, startAuth);
  yield takeLatest(types.AUTH_COMPLETE, completeAuth);
  yield takeLatest(types.LOGOUT, authLogout);
}
