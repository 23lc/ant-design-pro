import { getInfo } from '@/services/api';

export default {
  namespace: 'xssf',

  state: {
    info: null,
    trace: null,
    timestamp: null,
  },

  effects: {
    *fetchInfo({ payload }, { call, put }) {
      const response = yield call(getInfo, payload);
      yield put({
        type: 'updateInfo',
        payload: {
          value: payload.value,
          info: response,
        },
      });
    },
  },

  reducers: {
    updateInfo(state, { payload }) {
      let { info } = state;
      if (info === null) {
        info = [];
      }
      info.push({
        ...payload.info,
        key: Math.random(),
      });
      return {
        ...state,
        info,
        timestamp: new Date().getTime(),
      };
    },
    updateParams(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    clear() {
      return {
        info: null,
        trace: null,
      };
    },
  },
};
