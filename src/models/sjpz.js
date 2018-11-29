import { getModelList } from '@/services/api';

export default {
  namespace: 'sjpz',

  state: {
    modelList: [],
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
  },

  reducers: {
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
