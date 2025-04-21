import "@testing-library/jest-dom";

import { TextEncoder, TextDecoder } from 'util';
import { configure } from '@testing-library/react';


global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;


global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ data: "mocked response" }),
  })
) as jest.Mock;

configure({
  getElementError: (message, container) => {
    const error = new Error(message);
    error.name = 'TestingLibraryElementError';
    return error;
  },
});