import { describe, expect, it } from 'vitest';
import { firstSentences } from '#lib/text.ts';

describe('firstSentences', () => {
  const text =
    'It is JSON. A password encrypts it, if you set one. Rename it to .zip to look inside.';

  it('keeps whole sentences up to the room it has', () => {
    expect(firstSentences(text, 60)).toBe('It is JSON. A password encrypts it, if you set one.');
    expect(firstSentences(text, 200)).toBe(text);
  });

  it('always keeps the first, even when it runs over', () => {
    expect(firstSentences(text, 5)).toBe('It is JSON.');
  });

  it("doesn't split a file name or version in the middle", () => {
    expect(firstSentences('Ends in .json.aes or v1.15 here. Then more.', 33)).toBe(
      'Ends in .json.aes or v1.15 here.'
    );
  });

  it('stops at the first sentence that would overflow, not just that one', () => {
    expect(firstSentences('One. A much longer second sentence. Three.', 10)).toBe('One.');
  });
});
