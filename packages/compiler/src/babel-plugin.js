import * as t from "@babel/types";
const KAORI_PACKAGE_NAME = "kaori.js";
function findNonConflictingName(baseName, existingNames) {
    if (!existingNames.has(baseName)) {
        return baseName;
    }
    let counter = 1;
    let candidate = `${baseName}${counter}`;
    while (existingNames.has(candidate)) {
        counter++;
        candidate = `${baseName}${counter}`;
    }
    return candidate;
}
function jsxToLitHtmlPlugin() {
    return {
        name: "jsx-to-lit-html",
        visitor: {
            Program: {
                enter(path, state) {
                    state.needsComponentImport = false;
                    state.hasComponentImport = false;
                    state.needsHtmlImport = false;
                    state.hasHtmlImport = false;
                    // First, check what's already imported from kaori and their local names
                    const kaoriImports = new Map(); // imported name -> local name
                    path.traverse({
                        ImportDeclaration(innerPath) {
                            if (t.isStringLiteral(innerPath.node.source) &&
                                (innerPath.node.source.value === KAORI_PACKAGE_NAME ||
                                    innerPath.node.source.value.includes("kaori"))) {
                                innerPath.node.specifiers.forEach((spec) => {
                                    if (t.isImportSpecifier(spec) &&
                                        t.isIdentifier(spec.imported)) {
                                        const importedName = spec.imported.name;
                                        const localName = spec.local.name;
                                        kaoriImports.set(importedName, localName);
                                    }
                                });
                            }
                        },
                    });
                    // Use existing imports if available, otherwise find non-conflicting names
                    if (kaoriImports.has("html")) {
                        state.htmlTagName = kaoriImports.get("html");
                        state.hasHtmlImport = true;
                    }
                    if (kaoriImports.has("component")) {
                        state.componentFunctionName = kaoriImports.get("component");
                        state.hasComponentImport = true;
                    }
                    // Only scan for conflicts if we need to create new names
                    if (!state.hasHtmlImport || !state.hasComponentImport) {
                        const existingNames = new Set();
                        path.traverse({
                            Identifier(innerPath) {
                                existingNames.add(innerPath.node.name);
                            },
                        });
                        if (!state.hasHtmlImport) {
                            state.htmlTagName = findNonConflictingName("html", existingNames);
                        }
                        if (!state.hasComponentImport) {
                            state.componentFunctionName = findNonConflictingName("component", existingNames);
                        }
                    }
                },
                exit(path, state) {
                    // Add imports if needed
                    const imports = [];
                    if (state.needsComponentImport && !state.hasComponentImport) {
                        imports.push(t.importSpecifier(t.identifier(state.componentFunctionName), t.identifier("component")));
                    }
                    if (state.needsHtmlImport && !state.hasHtmlImport) {
                        imports.push(t.importSpecifier(t.identifier(state.htmlTagName), t.identifier("html")));
                    }
                    if (imports.length > 0) {
                        const kaoriImport = t.importDeclaration(imports, t.stringLiteral(KAORI_PACKAGE_NAME));
                        path.unshiftContainer("body", kaoriImport);
                    }
                },
            },
            ImportDeclaration(path, state) {
                // Check if component or html are already imported from kaori
                if (t.isStringLiteral(path.node.source) &&
                    (path.node.source.value === KAORI_PACKAGE_NAME ||
                        path.node.source.value.includes("kaori"))) {
                    path.node.specifiers.forEach((spec) => {
                        if (t.isImportSpecifier(spec) && t.isIdentifier(spec.imported)) {
                            if (spec.imported.name === "component") {
                                state.hasComponentImport = true;
                                state.componentFunctionName = spec.local.name;
                            }
                            if (spec.imported.name === "html") {
                                state.hasHtmlImport = true;
                                state.htmlTagName = spec.local.name;
                            }
                        }
                    });
                }
            },
            JSXElement(path, state) {
                const { node } = path;
                const tagName = getJSXElementName(node.openingElement.name);
                // Check if this is a component (starts with capital letter)
                if (isComponent(tagName)) {
                    state.needsComponentImport = true;
                    path.replaceWith(createComponentCall(node, tagName, state));
                }
                else {
                    state.needsHtmlImport = true;
                    path.replaceWith(createTemplateElement(node, state));
                }
            },
            JSXFragment(path, state) {
                // Handle fragments by wrapping content in template literal
                state.needsHtmlImport = true;
                const children = processJSXChildren(path.node.children, state);
                if (children.length === 0) {
                    // Empty fragment
                    const templateLiteral = t.templateLiteral([t.templateElement({ raw: "", cooked: "" }, true)], []);
                    path.replaceWith(t.taggedTemplateExpression(t.identifier(state.htmlTagName), templateLiteral));
                }
                else if (children.length === 1) {
                    // Single child - just wrap in html``
                    const templateLiteral = t.templateLiteral([
                        t.templateElement({ raw: "", cooked: "" }, false),
                        t.templateElement({ raw: "", cooked: "" }, true),
                    ], [children[0]]);
                    path.replaceWith(t.taggedTemplateExpression(t.identifier(state.htmlTagName), templateLiteral));
                }
                else {
                    // Multiple children - create array expression
                    path.replaceWith(t.arrayExpression(children));
                }
            },
        },
    };
}
function getJSXElementName(name) {
    if (t.isJSXIdentifier(name)) {
        return name.name;
    }
    if (t.isJSXMemberExpression(name)) {
        return `${getJSXElementName(name.object)}.${name.property.name}`;
    }
    if (t.isJSXNamespacedName(name)) {
        return `${name.namespace.name}:${name.name.name}`;
    }
    return "";
}
function isComponent(tagName) {
    return /^[A-Z]/.test(tagName);
}
function isSelfClosingTag(tagName) {
    const selfClosingTags = [
        "area",
        "base",
        "br",
        "col",
        "embed",
        "hr",
        "img",
        "input",
        "link",
        "meta",
        "param",
        "source",
        "track",
        "wbr",
    ];
    return selfClosingTags.includes(tagName.toLowerCase());
}
function normalizeAttributeName(attrName) {
    // Convert className to class
    if (attrName === "className")
        return "class";
    return attrName;
}
function createComponentCall(element, componentName, state) {
    const props = createPropsObject(element.openingElement.attributes);
    const children = processJSXChildren(element.children, state);
    // Add children to props if they exist
    if (children.length > 0) {
        const childrenValue = children.length === 1 ? children[0] : t.arrayExpression(children);
        if (t.isObjectExpression(props)) {
            props.properties.push(t.objectProperty(t.identifier("children"), childrenValue));
        }
    }
    return t.callExpression(t.identifier(state.componentFunctionName), [
        t.identifier(componentName),
        props,
    ]);
}
function createPropsObject(attributes) {
    const properties = [];
    for (const attr of attributes) {
        if (t.isJSXSpreadAttribute(attr)) {
            // Handle spread attributes
            properties.push(t.spreadElement(attr.argument));
        }
        else if (t.isJSXAttribute(attr)) {
            const propName = getAttributeName(attr);
            const propValue = getAttributeValue(attr);
            if (propName && propValue) {
                // Check if value needs getter wrapping (function calls, member access)
                if (needsGetterWrapping(propValue)) {
                    const getter = t.objectMethod("get", t.identifier(propName), [], t.blockStatement([t.returnStatement(propValue)]));
                    properties.push(getter);
                }
                else {
                    properties.push(t.objectProperty(t.identifier(propName), propValue));
                }
            }
        }
    }
    return t.objectExpression(properties);
}
function getAttributeName(attr) {
    if (t.isJSXIdentifier(attr.name)) {
        return attr.name.name;
    }
    if (t.isJSXNamespacedName(attr.name)) {
        return `${attr.name.namespace.name}:${attr.name.name.name}`;
    }
    return null;
}
function getAttributeValue(attr) {
    if (!attr.value) {
        return t.booleanLiteral(true);
    }
    if (t.isStringLiteral(attr.value)) {
        return attr.value;
    }
    if (t.isJSXExpressionContainer(attr.value)) {
        return attr.value.expression;
    }
    return null;
}
function needsGetterWrapping(expression) {
    let hasDynamicAccess = false;
    // Traverse the expression tree to find member access or function calls
    function traverse(node) {
        if (hasDynamicAccess)
            return; // Early exit if already found
        if (t.isMemberExpression(node) || t.isCallExpression(node)) {
            hasDynamicAccess = true;
            return;
        }
        // Stop traversal at function boundaries (inline functions should not cause wrapping)
        if (t.isArrowFunctionExpression(node) || t.isFunctionExpression(node)) {
            hasDynamicAccess = true; // Functions themselves need wrapping
            return; // But don't traverse into their bodies
        }
        // Continue traversing child nodes
        for (const key in node) {
            const child = node[key];
            if (child && typeof child === "object") {
                if (Array.isArray(child)) {
                    for (const item of child) {
                        if (item && typeof item === "object" && item.type) {
                            traverse(item);
                        }
                    }
                }
                else if (child.type) {
                    traverse(child);
                }
            }
        }
    }
    traverse(expression);
    return hasDynamicAccess;
}
function createTemplateElement(element, state) {
    const tagName = getJSXElementName(element.openingElement.name);
    const attributes = element.openingElement.attributes;
    const isSelfClosing = isSelfClosingTag(tagName);
    // Build the template string parts and expressions
    const templateParts = [];
    const expressions = [];
    // Start with opening tag
    let currentPart = `<${tagName}`;
    // Process attributes
    for (const attr of attributes) {
        if (t.isJSXAttribute(attr)) {
            const attrName = getAttributeName(attr);
            const attrValue = getAttributeValue(attr);
            if (attrName && attrValue) {
                const normalizedAttrName = normalizeAttributeName(attrName);
                if (attrName.startsWith("on")) {
                    // Event handlers: onClick -> @click=${}
                    const eventName = attrName.slice(2).toLowerCase();
                    currentPart += ` @${eventName}=`;
                    templateParts.push(currentPart);
                    expressions.push(attrValue);
                    currentPart = "";
                }
                else if (attrName.includes(":")) {
                    const [namespace, name] = attrName.split(":");
                    if (namespace === "prop") {
                        // prop:value -> .value=${}
                        currentPart += ` .${name}=`;
                        templateParts.push(currentPart);
                        expressions.push(attrValue);
                        currentPart = "";
                    }
                    else if (namespace === "bool") {
                        // bool:name -> ?name=${}
                        currentPart += ` ?${name}=`;
                        templateParts.push(currentPart);
                        expressions.push(attrValue);
                        currentPart = "";
                    }
                    else {
                        // Regular namespaced attribute
                        currentPart += ` ${attrName}="`;
                        templateParts.push(currentPart);
                        expressions.push(attrValue);
                        currentPart = `"`;
                    }
                }
                else if (t.isStringLiteral(attrValue)) {
                    // Regular string attribute
                    currentPart += ` ${normalizedAttrName}="${attrValue.value}"`;
                }
                else {
                    // Dynamic attribute
                    currentPart += ` ${normalizedAttrName}=`;
                    templateParts.push(currentPart);
                    expressions.push(attrValue);
                    currentPart = "";
                }
            }
        }
    }
    // Close opening tag and handle children/closing
    if (isSelfClosing) {
        // Self-closing tag - just close with />
        currentPart += " />";
        templateParts.push(currentPart);
    }
    else {
        // Regular element - close opening tag and add children
        currentPart += ">";
        // Process children more efficiently - combine static content
        const childResults = processJSXChildrenForTemplate(element.children, state);
        for (const result of childResults) {
            if (result.type === "static") {
                currentPart += result.content;
            }
            else {
                // Dynamic content - need expression
                templateParts.push(currentPart);
                expressions.push(result.expression);
                currentPart = "";
            }
        }
        // Add closing tag
        currentPart += `</${tagName}>`;
        templateParts.push(currentPart);
    }
    // Create template elements - must be exactly one more than expressions
    const templateElements = templateParts.map((part, index) => t.templateElement({ raw: part, cooked: part }, index === templateParts.length - 1));
    const templateLiteral = t.templateLiteral(templateElements, expressions);
    return t.taggedTemplateExpression(t.identifier(state.htmlTagName), templateLiteral);
}
function processJSXChildrenForTemplate(children, state) {
    const results = [];
    for (const child of children) {
        if (t.isJSXText(child)) {
            // Include text directly in the template (preserve whitespace for inline text)
            const text = child.value;
            if (text.trim()) {
                // Has meaningful content, add as static text
                results.push({ type: "static", content: text });
            }
            else if (text.includes("\n")) {
                // Just whitespace with newlines, skip it
                continue;
            }
            else {
                // Inline whitespace, preserve it
                results.push({ type: "static", content: text });
            }
        }
        else if (t.isJSXExpressionContainer(child)) {
            if (t.isExpression(child.expression)) {
                results.push({ type: "dynamic", expression: child.expression });
            }
        }
        else if (t.isJSXElement(child)) {
            const tagName = getJSXElementName(child.openingElement.name);
            if (isComponent(tagName)) {
                state.needsComponentImport = true;
                results.push({
                    type: "dynamic",
                    expression: createComponentCall(child, tagName, state),
                });
            }
            else {
                // For HTML elements, check if they have only simple attributes and text content
                if (canInlineAsStaticHTML(child)) {
                    results.push({
                        type: "static",
                        content: convertElementToStaticHTML(child),
                    });
                }
                else {
                    // Instead of creating nested html templates, inline the element structure
                    const elementResult = inlineElementInTemplate(child, state);
                    results.push(...elementResult);
                }
            }
        }
        else if (t.isJSXFragment(child)) {
            const fragmentResults = processJSXChildrenForTemplate(child.children, state);
            results.push(...fragmentResults);
        }
    }
    return results;
}
function canInlineAsStaticHTML(element) {
    // Can inline if element has no dynamic attributes and all children are static
    const hasOnlyStaticAttributes = element.openingElement.attributes.every((attr) => {
        if (t.isJSXAttribute(attr)) {
            const attrValue = getAttributeValue(attr);
            return (!attrValue ||
                t.isStringLiteral(attrValue) ||
                t.isBooleanLiteral(attrValue));
        }
        return false; // spread attributes are dynamic
    });
    if (!hasOnlyStaticAttributes)
        return false;
    // Check if all children are static text or static HTML elements
    return element.children.every((child) => {
        if (t.isJSXText(child))
            return true;
        if (t.isJSXElement(child)) {
            const tagName = getJSXElementName(child.openingElement.name);
            return !isComponent(tagName) && canInlineAsStaticHTML(child);
        }
        return false; // expressions or fragments are dynamic
    });
}
function convertElementToStaticHTML(element) {
    const tagName = getJSXElementName(element.openingElement.name);
    const isSelfClosing = isSelfClosingTag(tagName);
    let html = `<${tagName}`;
    // Add attributes
    for (const attr of element.openingElement.attributes) {
        if (t.isJSXAttribute(attr)) {
            const attrName = getAttributeName(attr);
            const attrValue = getAttributeValue(attr);
            if (attrName && attrValue) {
                const normalizedAttrName = normalizeAttributeName(attrName);
                if (t.isStringLiteral(attrValue)) {
                    html += ` ${normalizedAttrName}="${attrValue.value}"`;
                }
                else if (t.isBooleanLiteral(attrValue) && attrValue.value) {
                    html += ` ${normalizedAttrName}`;
                }
            }
        }
    }
    if (isSelfClosing) {
        html += " />";
    }
    else {
        html += ">";
        // Add children
        for (const child of element.children) {
            if (t.isJSXText(child)) {
                html += child.value;
            }
            else if (t.isJSXElement(child)) {
                html += convertElementToStaticHTML(child);
            }
        }
        html += `</${tagName}>`;
    }
    return html;
}
function inlineElementInTemplate(element, state) {
    const tagName = getJSXElementName(element.openingElement.name);
    const attributes = element.openingElement.attributes;
    const isSelfClosing = isSelfClosingTag(tagName);
    const results = [];
    // Start with opening tag
    let currentPart = `<${tagName}`;
    // Process attributes
    for (const attr of attributes) {
        if (t.isJSXAttribute(attr)) {
            const attrName = getAttributeName(attr);
            const attrValue = getAttributeValue(attr);
            if (attrName && attrValue) {
                const normalizedAttrName = normalizeAttributeName(attrName);
                if (attrName.startsWith("on")) {
                    // Event handlers: onClick -> @click=${}
                    const eventName = attrName.slice(2).toLowerCase();
                    currentPart += ` @${eventName}=`;
                    results.push({ type: "static", content: currentPart });
                    results.push({ type: "dynamic", expression: attrValue });
                    currentPart = "";
                }
                else if (attrName.includes(":")) {
                    const [namespace, name] = attrName.split(":");
                    if (namespace === "prop") {
                        // prop:value -> .value=${}
                        currentPart += ` .${name}=`;
                        results.push({ type: "static", content: currentPart });
                        results.push({ type: "dynamic", expression: attrValue });
                        currentPart = "";
                    }
                    else if (namespace === "bool") {
                        // bool:name -> ?name=${}
                        currentPart += ` ?${name}=`;
                        results.push({ type: "static", content: currentPart });
                        results.push({ type: "dynamic", expression: attrValue });
                        currentPart = "";
                    }
                    else {
                        // Regular namespaced attribute
                        currentPart += ` ${attrName}="`;
                        results.push({ type: "static", content: currentPart });
                        results.push({ type: "dynamic", expression: attrValue });
                        currentPart = `"`;
                    }
                }
                else if (t.isStringLiteral(attrValue)) {
                    // Regular string attribute
                    currentPart += ` ${normalizedAttrName}="${attrValue.value}"`;
                }
                else {
                    // Dynamic attribute
                    currentPart += ` ${normalizedAttrName}=`;
                    results.push({ type: "static", content: currentPart });
                    results.push({ type: "dynamic", expression: attrValue });
                    currentPart = "";
                }
            }
        }
    }
    // Close opening tag and handle children/closing
    if (isSelfClosing) {
        // Self-closing tag - just close with />
        currentPart += " />";
        results.push({ type: "static", content: currentPart });
    }
    else {
        // Regular element - close opening tag and add children
        currentPart += ">";
        // Process children
        const childResults = processJSXChildrenForTemplate(element.children, state);
        if (childResults.length === 0) {
            // No children, just close the tag
            currentPart += `</${tagName}>`;
            results.push({ type: "static", content: currentPart });
        }
        else {
            // Add opening tag part
            if (currentPart) {
                results.push({ type: "static", content: currentPart });
            }
            // Add children
            results.push(...childResults);
            // Add closing tag
            results.push({ type: "static", content: `</${tagName}>` });
        }
    }
    return results;
}
function processJSXChildren(children, state) {
    const processedChildren = [];
    for (const child of children) {
        if (t.isJSXText(child)) {
            // Only include text if it has non-whitespace content
            const text = child.value.trim();
            if (text) {
                processedChildren.push(t.stringLiteral(text));
            }
        }
        else if (t.isJSXExpressionContainer(child)) {
            if (t.isExpression(child.expression)) {
                processedChildren.push(child.expression);
            }
        }
        else if (t.isJSXElement(child)) {
            const tagName = getJSXElementName(child.openingElement.name);
            if (isComponent(tagName)) {
                state.needsComponentImport = true;
                processedChildren.push(createComponentCall(child, tagName, state));
            }
            else {
                state.needsHtmlImport = true;
                processedChildren.push(createTemplateElement(child, state));
            }
        }
        else if (t.isJSXFragment(child)) {
            const fragmentChildren = processJSXChildren(child.children, state);
            processedChildren.push(...fragmentChildren);
        }
    }
    return processedChildren;
}
export default jsxToLitHtmlPlugin;
//# sourceMappingURL=babel-plugin.js.map