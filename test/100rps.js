import http from 'k6/http';
import { sleep, check } from 'k6';
import { Counter } from 'k6/metrics';

export const requests = new Counter('http_reqs');

export const options = {
  vus: 100, //how many users to be simulated
  duration: '15s', // how long the test will run
};

const url = 'http://localhost:3000/qa/questions?product_id=1';
// const url = 'http://localhost:3000/qa/questions/1/answers';

export default function () {
  const res = http.get(url);
  sleep(1);
  check(res, {
    'is status 200': (r) => r.status === 200,
    'transaction time < 200ms': (r) => r.timings.duration < 200,
    'transaction time < 500ms': (r) => r.timings.duration < 500,
    'transaction time < 1000ms': (r) => r.timings.duration < 1000,
    'transaction time < 2000ms': (r) => r.timings.duration < 2000,
  });
}

// //Below randomize the endpoints
// export default function () {
//   http.get(`http://localhost:3001/questions/?product_id=${Math.floor(Math.random() * (1000000 - 1 + 1)) + 1}`);
//   }
