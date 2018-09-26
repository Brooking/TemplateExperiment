// This will become HTMLTemplateElement.findParts(1 param)
function HTMLTemplateElement_findParts(thisTemplateElement) {
  // instantiate and parse the template
  let documentFragment = document.importNode(thisTemplateElement.content,
        true/*deep*/);
  return new PartedTemplate(documentFragment);
}

//
// PartedTemplate class
//
class PartedTemplate {
  constructor(documentFragment) {
    this._documentFragment = documentFragment;

    let parser = new PartParser(this._documentFragment);
    this._partLocations = parser.partLocations;
  }

  get partLocations() {
    return this._partLocations;
  }
}

//
// PartLocation base class
//
class PartLocation {
  constructor(expression, node, start, end) {
    this._expression = expression;
    this._node = node;
    this._start = start;
    this._end = end;
  }

  get expression() {
    return this._expression;
  }

  get node() {
    return this._node;
  }

  get start() {
    return this._start;
  }

  get end() {
    return this._end;
  }
}

//
// AttributePartLocation class
//
class AttributePartLocation extends PartLocation {
  constructor(expression, node, attributeName, start, end) {
    super(expression, node, start, end);
    this._attributeName = attributeName;
  }

  get attributeName() {
    return this._attributeName;
  }
}

//
// WholeAttributePartLocation class
//
class WholeAttributePartLocation extends PartLocation {
  constructor(expression, node) {
    super(expression, node, 0, 0);
  }
}

//
// NodePartLocation class
//
class NodePartLocation extends PartLocation {
  constructor(expression, node, start, end) {
    super(expression, node, start, end);
  }
}

//
// TemplatePartLocation class
//
class TemplatePartLocation extends PartLocation {
  constructor(node) {
    super(null, node, 0, 0)
  }
}

//
// PartParser class
//
class PartParser {
  constructor(documentFragment) {
    this._partLocations = [];
    this._findPartsInFragment(documentFragment);
  }

  get partLocations() {
    return this._partLocations;
  }

  _findPartsInFragment(documentFragment) {
    for (let child = documentFragment.firstChild;
         child != null;
         child = child.nextSibling) {
      this._findPartsInTree(child);
    }
  }

  _findPartsInTree(root) {
    let walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let node = walker.currentNode;
    while (node) {
      if (node.nodeType == Node.ELEMENT_NODE) {
        if (node.tagName == "TEMPLATE") {
          this._partLocations.push(
            new TemplatePartLocation(node));
          node = walker.nextSibling();
        } else {
          this._findPartsInElementNode(node);
          node = walker.nextNode();
        }
      } else if (node.nodeType == Node.TEXT_NODE) {
        this._findPartsInTextNode(node);
        node = walker.nextNode();
      } else {
        window.alert("_findPartsInTree ran across a " + node.nodeType);
      }
    };
  }

  _findPartsInElementNode(elementNode) {
    let attributeNames = elementNode.getAttributeNames();
    for (const attributeName of attributeNames) {
      let part = PartParser._findNextPart(attributeName);
      if (part != null) {
        // this is a whole attribute part
        this._partArray.push(
            new WholeAttributePartLocation(part.id, elementNode));
      } else {
        let attributeValue = elementNode.getAttribute(attributeName);
        let part = PartParser._findNextPart(attributeValue);
        while (part != null) {
          this._partLocations.push(
            new AttributePartLocation(part.id, elementNode, attributeName,
                                      part.start, part.end));
          part = PartParser._findNextPart(attributeValue, part.end);
        }
      }
    }
  }

  _findPartsInTextNode(textNode) {
    let text = textNode.textContent;
    let part = PartParser._findNextPart(text);
    while (part != null) {
      this._partLocations.push(
        new NodePartLocation(part.id, textNode, part.start, part.end));
      part = PartParser._findNextPart(text, part.end);
    }
  }

  // returns the gap before the starting {{ and the gap after the ending }}
  // {start:#, end:#, id:string}
  static _findNextPart(string, base = 0) {
    let beforeOpenTagOffsetFromBase = string.substring(base).search("{{");
    if (beforeOpenTagOffsetFromBase != -1) {
      let beforeCloseTagOffsetFromBase = string.substring(base).search("}}");
      if (beforeCloseTagOffsetFromBase != -1) {
        return {
          start: beforeOpenTagOffsetFromBase + base,
          end: beforeCloseTagOffsetFromBase + base + 2,
          id: string.substring(
            beforeOpenTagOffsetFromBase + base + 2,
            beforeCloseTagOffsetFromBase + base
          )
        };
      }
    }
    return null;
  }
}
