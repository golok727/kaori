// todo add vitest
import babel from "@babel/core";
import jsxToLitHtmlPlugin from "../babel-plugin.js";
async function runTest(testName, jsxCode) {
    console.log(`\n=== ${testName} ===`);
    try {
        const result = await babel.transformAsync(jsxCode, {
            plugins: [["@babel/plugin-syntax-jsx"], [jsxToLitHtmlPlugin]],
            parserOpts: {
                plugins: ["jsx", "typescript"],
            },
        });
        console.log("Input JSX:");
        console.log(jsxCode.trim());
        console.log("\nTransformed Output:");
        console.log(result?.code || "No output");
        console.log("\n" + "=".repeat(50));
    }
    catch (error) {
        console.error("Transformation failed:", error);
    }
}
// Test 1: Basic nested elements
const basicNestedTest = `
function Basic() {
  return (
    <div className="container">
      <header>
        <h1>Title</h1>
        <nav>
          <a href="/home">Home</a>
          <a href="/about">About</a>
        </nav>
      </header>
      <main>
        <p>Content here</p>
      </main>
    </div>
  );
}`;
// Test 2: Mixed children (text, expressions, elements)
const mixedChildrenTest = `
function MixedChildren() {
  const name = "World";
  const count = 42;
  return (
    <div>
      Hello {name}!
      <span>Count: {count}</span>
      Some more text
      <p>Paragraph</p>
      Final text
    </div>
  );
}`;
// Test 3: Components with children
const componentsWithChildrenTest = `
function ComponentChildren() {
  return (
    <Layout>
      <Header title="My App" />
      <Content>
        <Article title={getTitle()}>
          <p>Article content</p>
          <Comments comments={getComments()} />
        </Article>
      </Content>
      <Footer />
    </Layout>
  );
}`;
// Test 4: Fragments
const fragmentsTest = `
function FragmentTest() {
  return (
    <>
      <h1>Title</h1>
      <p>Paragraph 1</p>
      <p>Paragraph 2</p>
    </>
  );
}`;
// Test 5: Complex nesting with all attribute types
const complexNestingTest = `
function ComplexNesting() {
  return (
    <div className="outer">
      <input 
        type="text" 
        prop:value={getValue()} 
        bool:disabled={isDisabled()}
        onChange={handleChange}
      />
      <Show when={showContent()}>
        <div className="inner">
          <For items={items()}>
            {(item) => (
              <Card key={item.id}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <button onClick={() => handleClick(item.id)}>
                  {item.completed ? "Undo" : "Complete"}
                </button>
              </Card>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}`;
// Test 6: Self-closing elements
const selfClosingTest = `
function SelfClosing() {
  return (
    <div>
      <img src="/logo.png" alt="Logo" />
      <input type="text" prop:value={text()} />
      <br />
      <hr className="divider" />
      <meta name="description" content="Test" />
    </div>
  );
}`;
// Test 7: Empty children and whitespace
const emptyChildrenTest = `
function EmptyChildren() {
  return (
    <div>
      <Empty />
      
      <WithChildren>
        
      </WithChildren>
      
      <p></p>
    </div>
  );
}`;
const importThingTest = `
function ImportThing() {
return <div><ImportThing/></div>;
}
`;
// Test 8: Getter Wrapping for Complex Expressions
const getterWrappingTest = `
function GetterWrapping() {
  const count = { value: 5 };
  return (
    <div>
      <Component when={count.value > 10} />
      <Component count={count.value} />
      <Component onClick={handleClick} />
      <Component data={getData()} />
      <Component isActive={user.isLoggedIn && user.role === 'admin'} />
      <Component simple="static string" />
      <Component number={42} />
      <Component condition={a > b && c.value < d.getValue()} />
    </div>
  );
}`;
async function runAllTests() {
    console.log("🧪 Running Comprehensive JSX to lit-html Tests");
    await runTest("Basic Nested Elements", basicNestedTest);
    await runTest("Mixed Children Types", mixedChildrenTest);
    await runTest("Components with Children", componentsWithChildrenTest);
    await runTest("Fragments", fragmentsTest);
    await runTest("Complex Nesting with All Attributes", complexNestingTest);
    await runTest("Self-Closing Elements", selfClosingTest);
    await runTest("Empty Children and Whitespace", emptyChildrenTest);
    await runTest("Import Thing", importThingTest);
    await runTest("Getter Wrapping for Complex Expressions", getterWrappingTest);
    console.log("\n✅ All tests completed!");
}
runAllTests();
//# sourceMappingURL=test.js.map