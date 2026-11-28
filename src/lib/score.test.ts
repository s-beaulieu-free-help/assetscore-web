import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { headlineScore } from "./score";

describe("headline score", () => {
  it("moves five scores 15% toward the median and rounds the average", () => {
    assert.equal(headlineScore([90, 80, 75, 70, 20]), 68);
  });

  it("leaves the average of two scores unchanged", () => {
    assert.equal(headlineScore([90, 60]), 75);
  });

  it("uses a single score unchanged", () => {
    assert.equal(headlineScore([82]), 82);
  });

  it("ignores missing dimensions", () => {
    assert.equal(headlineScore([90, null, 70, undefined, 30]), 64);
  });

  it("stays put when every score is equal", () => {
    assert.equal(headlineScore([75, 75, 75, 75, 75]), 75);
  });

  it("returns null when nothing is available", () => {
    assert.equal(headlineScore([null, undefined]), null);
  });

  it("keeps boundary and decimal inputs inside 0–100", () => {
    assert.equal(headlineScore([0, 0, 0]), 0);
    assert.equal(headlineScore([100, 100, 100]), 100);
    assert.equal(headlineScore([0, 100]), 50);
    assert.equal(headlineScore([99.6]), 100);
    assert.equal(headlineScore([10.2, 80.4, 40.5]), 43);
    const score = headlineScore([0.4, 99.8, 50.2]);
    assert.ok(score != null && score >= 0 && score <= 100);
  });
});
