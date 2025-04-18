import "@testing-library/jest-dom";

import { TextEncoder, TextDecoder } from 'util';


global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;


global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ data: "mocked response" }),
  })
) as jest.Mock;