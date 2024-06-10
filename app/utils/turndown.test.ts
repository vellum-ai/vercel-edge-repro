import { JSDOM } from "jsdom";
import { beforeAll, describe, expect, it } from "vitest";
import { turndown } from "./turndown";

let NodePolyfill: typeof Node;
beforeAll(() => {
  NodePolyfill = new JSDOM().window.Node;
  global.Node = NodePolyfill;
});

describe("olToGfmMarkdown", () => {
  it("should convert a IM math block to markdown", () => {
    // https://im.kendallhunt.com/MS/teachers/1/6/5/index.html Anticipated Misconceptions section
    const html = String.raw`
<div class="im-c-content">
<p>Monitor for students&nbsp;who&nbsp;want to turn <span class="math math-repaired" data-png-file-id="3511"><span class="MathJax_Preview" style="display: none;"></span><span class="MathJax_SVG" id="MathJax-Element-30-Frame" tabindex="0" style="font-size: 100%; display: inline-block;"><svg xmlns:xlink="http://www.w3.org/1999/xlink" width="2.48ex" height="3.364ex" viewBox="0 -1002 1067.8 1448.4" role="img" focusable="false" style="vertical-align: -1.037ex;"><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="matrix(1 0 0 -1 0 0)"><g transform="translate(120,0)"><rect stroke="none" width="827" height="60" x="0" y="220"></rect><g transform="translate(60,430)"><use transform="scale(0.707)" xlink:href="#MJMAIN-33"></use><use transform="scale(0.707)" xlink:href="#MJMAIN-35" x="500" y="0"></use></g><g transform="translate(60,-386)"><use transform="scale(0.707)" xlink:href="#MJMAIN-31"></use><use transform="scale(0.707)" xlink:href="#MJMAIN-31" x="500" y="0"></use></g></g></g></svg></span><script type="math/tex" id="MathJax-Element-30">\frac{35}{11}</script></span> into a decimal, and reassure them that&nbsp;<span class="math math-repaired" data-png-file-id="3511"><span class="MathJax_Preview" style="display: none;"></span><span class="MathJax_SVG" id="MathJax-Element-31-Frame" tabindex="0" style="font-size: 100%; display: inline-block;"><svg xmlns:xlink="http://www.w3.org/1999/xlink" width="2.48ex" height="3.364ex" viewBox="0 -1002 1067.8 1448.4" role="img" focusable="false" style="vertical-align: -1.037ex;"><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="matrix(1 0 0 -1 0 0)"><g transform="translate(120,0)"><rect stroke="none" width="827" height="60" x="0" y="220"></rect><g transform="translate(60,430)"><use transform="scale(0.707)" xlink:href="#MJMAIN-33"></use><use transform="scale(0.707)" xlink:href="#MJMAIN-35" x="500" y="0"></use></g><g transform="translate(60,-386)"><use transform="scale(0.707)" xlink:href="#MJMAIN-31"></use><use transform="scale(0.707)" xlink:href="#MJMAIN-31" x="500" y="0"></use></g></g></g></svg></span><script type="math/tex" id="MathJax-Element-31">\frac{35}{11}</script></span> is a number.</p>
</div>
`;
    const markdown = turndown(html);
    expect(markdown).toBe(
      "Monitor for students who want to turn $\\frac{35}{11}$ into a decimal, and reassure them that $\\frac{35}{11}$ is a number.",
    );
  });
  it("should convert a real IM section to GFM markdown", () => {
    const html = String.raw`
<div class="im-c-content">
<ol>
	<li>
<span class="math math-repaired" data-png-file-id="3543"><span class="MathJax_Preview" style="display: none;"></span><span class="MathJax_SVG" id="MathJax-Element-4-Frame" tabindex="0" style="font-size: 100%; display: inline-block;"><svg xmlns:xlink="http://www.w3.org/1999/xlink" width="3.203ex" height="2.074ex" viewBox="0 -779.8 1379 892.9" role="img" focusable="false" style="vertical-align: -0.263ex;"><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="matrix(1 0 0 -1 0 0)"><use xlink:href="#MJMAIN-34" x="0" y="0"></use><use xlink:href="#MJMATHI-6D" x="500" y="0"></use></g></svg></span><script type="math/tex" id="MathJax-Element-4">4m</script></span> (or equivalent)</li>
	<li>12 square units, 8.8 square units, <span class="math math-repaired" data-png-file-id="2293"><span class="MathJax_Preview" style="display: none;"></span><span class="MathJax_SVG" id="MathJax-Element-5-Frame" tabindex="0" style="font-size: 100%; display: inline-block;"><svg xmlns:xlink="http://www.w3.org/1999/xlink" width="1.658ex" height="3.493ex" viewBox="0 -1002 713.9 1504" role="img" focusable="false" style="vertical-align: -1.166ex;"><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="matrix(1 0 0 -1 0 0)"><g transform="translate(120,0)"><rect stroke="none" width="473" height="60" x="0" y="220"></rect><use transform="scale(0.707)" xlink:href="#MJMAIN-34" x="84" y="586"></use><use transform="scale(0.707)" xlink:href="#MJMAIN-35" x="84" y="-546"></use></g></g></svg></span><script type="math/tex" id="MathJax-Element-5">\frac45</script></span> square units</li>
	<li>Yes, the area could be 11 square units. <span class="math math-repaired" data-png-file-id="40"><span class="MathJax_Preview" style="display: none;"></span><span class="MathJax_SVG" id="MathJax-Element-6-Frame" tabindex="0" style="font-size: 100%; display: inline-block;"><svg xmlns:xlink="http://www.w3.org/1999/xlink" width="2.04ex" height="1.429ex" viewBox="0 -502 878.5 615.1" role="img" focusable="false" style="vertical-align: -0.263ex;"><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="matrix(1 0 0 -1 0 0)"><use xlink:href="#MJMATHI-6D" x="0" y="0"></use></g></svg></span><script type="math/tex" id="MathJax-Element-6">m</script></span> would have to be <span class="math math-repaired" data-png-file-id="17963"><span class="MathJax_Preview" style="display: none;"></span><span class="MathJax_SVG" id="MathJax-Element-7-Frame" tabindex="0" style="font-size: 100%; display: inline-block;"><svg xmlns:xlink="http://www.w3.org/1999/xlink" width="2.48ex" height="3.364ex" viewBox="0 -946.4 1067.8 1448.4" role="img" focusable="false" style="vertical-align: -1.166ex;"><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="matrix(1 0 0 -1 0 0)"><g transform="translate(120,0)"><rect stroke="none" width="827" height="60" x="0" y="220"></rect><g transform="translate(60,414)"><use transform="scale(0.707)" xlink:href="#MJMAIN-31"></use><use transform="scale(0.707)" xlink:href="#MJMAIN-31" x="500" y="0"></use></g><use transform="scale(0.707)" xlink:href="#MJMAIN-34" x="335" y="-557"></use></g></g></svg></span><script type="math/tex" id="MathJax-Element-7">\frac{11}{4}</script></span> units, since <span class="math math-repaired" data-png-file-id="41310"><span class="MathJax_Preview" style="display: none;"></span><span class="MathJax_SVG" id="MathJax-Element-8-Frame" tabindex="0" style="font-size: 100%; display: inline-block;"><svg xmlns:xlink="http://www.w3.org/1999/xlink" width="11.03ex" height="3.364ex" viewBox="0 -946.4 4748.9 1448.4" role="img" focusable="false" style="vertical-align: -1.166ex;"><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="matrix(1 0 0 -1 0 0)"><use xlink:href="#MJMAIN-34" x="0" y="0"></use><g transform="translate(722,0)"><g><use transform="scale(1.44)" xlink:href="#MJMAIN-22C5" x="0" y="-70"></use></g></g><g transform="translate(1123,0)"><g transform="translate(342,0)"><rect stroke="none" width="827" height="60" x="0" y="220"></rect><g transform="translate(60,414)"><use transform="scale(0.707)" xlink:href="#MJMAIN-31"></use><use transform="scale(0.707)" xlink:href="#MJMAIN-31" x="500" y="0"></use></g><use transform="scale(0.707)" xlink:href="#MJMAIN-34" x="335" y="-557"></use></g></g><use xlink:href="#MJMAIN-3D" x="2691" y="0"></use><g transform="translate(3747,0)"><use xlink:href="#MJMAIN-31"></use><use xlink:href="#MJMAIN-31" x="500" y="0"></use></g></g></svg></span><script type="math/tex" id="MathJax-Element-8">4 \boldcdot \frac{11}{4}=11</script></span>.</li>
</ol>
</div>
`;
    const expected = String.raw`1. 4m (or equivalent)
2. 12 square units, 8.8 square units, \frac45 square units
3. Yes, the area could be 11 square units. m would have to be \frac{11}{4} units, since 4 \boldcdot \frac{11}{4}=11 .`;
    expect(turndown(html)).toBe(expected);
  });
  it("should convert a single-level ordered list to GFM markdown", () => {
    const html = `
      <ol>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
      </ol>
    `;
    const markdown = turndown(html);
    expect(markdown).toBe("1. Item 1\n2. Item 2\n3. Item 3");
  });

  it("should convert a nested ordered list to GFM markdown", () => {
    const html = `
      <ol>
        <li>Item 1
          <ol>
            <li>Subitem 1a</li>
            <li>Subitem 1b</li>
          </ol>
        </li>
        <li>Item 2</li>
      </ol>
    `;
    const markdown = turndown(html);
    expect(markdown).toBe(
      "1. Item 1 \n  a. Subitem 1a\n  b. Subitem 1b\n\n2. Item 2",
    );
  });

  it("should handle complex nested lists with multiple levels", () => {
    const html = `
      <ol>
        <li>Item 1
          <ol>
            <li>Subitem 1a
              <ol>
                <li>Sub-subitem 1a1</li>
              </ol>
            </li>
            <li>Subitem 1b</li>
          </ol>
        </li>
        <li>Item 2</li>
      </ol>
    `;
    expect(turndown(html)).toBe(
      "1. Item 1 \n  a. Subitem 1a \n    i. Sub-subitem 1a1\n\n  b. Subitem 1b\n\n2. Item 2",
    );
  });
});
