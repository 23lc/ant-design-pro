import { getTrace, getInfo } from '@/services/api';

export default {
  namespace: 'list',

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

    *fetchTrace({ payload }, { call, put }) {
      const response = yield call(getTrace, payload);
      yield put({
        type: 'updateTrace',
        payload: {
          value: payload.value,
          trace: response.basicStations,
        },
      });
    },
  },

  reducers: {
    updateInfo(state, { payload }) {
      let { info } = state;
      if (info === null) {
        info = {};
      }
      info[payload.value] = payload.info;
      return {
        ...state,
        info,
      };
    },
    updateTrace(state, { payload }) {
      let { trace } = state;
      if (trace === null) {
        trace = {};
      }
      trace[payload.value] = payload.trace;
      return {
        ...state,
        trace,
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
