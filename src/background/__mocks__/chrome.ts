const storageData: Record<string, any> = {};

export const chrome = {
  storage: {
    local: {
      get: jest.fn((keys, callback) => {
        if (Array.isArray(keys)) {
          const result: any = {};
          keys.forEach((key) => (result[key] = storageData[key]));
          callback(result);
        } else {
          callback({ [keys]: storageData[keys] });
        }
      }),
      set: jest.fn((items, callback) => {
        Object.assign(storageData, items);
        if (callback) callback();
      }),
      clear: jest.fn((callback) => {
        for (const key in storageData) {
          delete storageData[key];
        }
        if (callback) callback();
      }),
    },
  },
  runtime: {
    lastError: null,
  },
};
