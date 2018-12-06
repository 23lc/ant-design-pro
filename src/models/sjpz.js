import { getModelList, getTrace, getInfo } from '@/services/api';

export default {
  namespace: 'sjpz',

  state: {
    modelList: [],
    treeNodes: [],
    resource: [],
    timestamp: null,
    formPanel: null,
    info: null,
    trace: null,
  },

  effects: {
    *fetchModelList({ payload }, { call, put }) {
      const response = yield call(getModelList, payload);
      yield put({
        type: 'updateParams',
        payload: {
          // value: payload.value,
          modelList: response,
        },
      });
    },
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
  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ query: { modelId } }) => {
        // todo: 获取当前模型下所有的tree_node和resource
        console.log(dispatch, modelId);
      });
    },
  },
};
