// This will become HTMLTemplateElement.instantiate()
function HTMLTemplateElement_instantiate(thisTemplateElement, partProcessor,
                                         params) {
  // instantiate the template
  let documentFragment = document.importNode(thisTemplateElement.content,
                                             true/*deep*/);
  let templateInstance = new TemplateInstance(documentFragment);

  // stamp the template instance
  templateInstance.update(partProcessor, params);
  return templateInstance;
}

//
// TemplateInstance class
//
class TemplateInstance {
  constructor(documentFragment) {
    this._documentFragment = documentFragment;

    let parser = new PartParser(this);
    this._partArray = parser.parts;

    // remove any internal templates, but keep track of where they go
    this._foreachTemplates = [];
    parser.internalTemplateNodes.forEach(templateNode => {
      if (templateNode.getAttribute('processor') == 'for-each') {
        let placeholder = new Text("");
        templateNode.parentElement.replaceChild(placeholder, templateNode);
        this._foreachTemplates.push({templateNode: templateNode,
                                     firstNode: null,
                                     placeholder: placeholder});
      } else {
          window.alert("The only type of embedded template we know is 'for-each'");
      }
    })
  }

  get documentFragment() {
    return this._documentFragment;
  }

  update(partProcessor, params) {
    // process the parts in this template
    if (this._partArray !== undefined) {
      if (partProcessor == null) {
        partProcessor = TemplateInstance._defaultPartProcessor;
      }
      partProcessor(this._partArray, params);
    }

    // insert new template instances (rows)
    this._foreachTemplates.forEach(templateStruct => {
      let templateNode = templateStruct.templateNode;
      let placeholder = templateStruct.placeholder;
      let itemsKey = templateNode.getAttribute('items');
      itemsKey = itemsKey.substring(2, itemsKey.length - 2);
      let items = params[itemsKey];

      while (templateStruct.firstNode != null &&
             templateStruct.firstNode != placeholder) {
        let nodeToRemove = templateStruct.firstNode;
        templateStruct.firstNode = templateStruct.firstNode.nextSibling;
        nodeToRemove.parentElement.removeChild(nodeToRemove);
      }

      let startMarker = new Text("");
      placeholder.parentElement.insertBefore(startMarker, placeholder);

      for (const item of items) {
        let documentFragment = document.importNode(templateNode.content,
                                                   true/*deep*/);
        let newTemplateInstance = new TemplateInstance(documentFragment);
        newTemplateInstance.update(partProcessor, item);
        placeholder.parentElement.insertBefore(
            newTemplateInstance.documentFragment,
            placeholder);
      };

      templateStruct.firstNode = startMarker.nextSibling;
      startMarker.parentElement.removeChild(startMarker);
    })
  }

  static _defaultPartProcessor(parts, params) {
    for (const part of parts) {
      part.replaceWith(params[part.expression]);
    }
  }

  adjustAttributes(changingPart, adjustment) {
    for (const part of this._partArray) {
      if (part != changingPart &&
        part.node == changingPart.node &&
        part.attributeName == changingPart.attributeName &&
        part.start >= changingPart.start) {
          // this is a part to the right of the changing one, fix it up
          part.start += adjustment;
          part.end += adjustment;
      }
    }
  }

  adjustText(changingPart, adjustment) {
    for (const part of this._partArray) {
        if (part != changingPart &&
            part.node == changingPart.node &&
            part.start >= changingPart.start) {
                // this is a part to the right of the changing one, fix it up
                part.start += adjustment;
                part.end += adjustment;
        }
    }
  }

  adjustTextInNewNode(changingPart, newNode, adjustment) {
      for (const part of this._partArray) {
          if (part != changingPart &&
              part.node == changingPart.node &&
              part.start >= changingPart.start) {
                  // this is a part to the right of the changing one, fix it up
                  part.node = newNode;
                  part.start += adjustment;
                  part.end += adjustment;
          }
      }
  }
}


//
// TemplatePart base class
//
class TemplatePart {
  constructor(templateInstance, expression, node, start, end) {
    this._templateInstance = templateInstance;
    this._expression = expression;
    this._node = node;
    this._start = start;
    this._end = end;
  }

  get expression() {
    return this._expression;
  }

}

//
// AttributeTemplatePart class
//
class AttributeTemplatePart extends TemplatePart {
  constructor(templateInstance, expression, node, attributeName, start, end) {
    super(templateInstance, expression, node, start, end);
    this._attributeName = attributeName;
  }

  get attribute() {
    return this._attributeName;
  }

  get value() {
    let rawAttributeValue = this._node.getAttribute(this._attributeName);
    return rawAttributeValue.substring(this._start, this._end);
  }

  replaceWith(newPartValue) {
    let rawAttributeValue = this._node.getAttribute(this._attributeName);
    let oldPartValue = this.value;
    if (newPartValue == undefined) {
      newPartValue = "";
    }
    rawAttributeValue = rawAttributeValue.substring(0, this._start) +
      newPartValue +
      rawAttributeValue.substring(this._end);
    this._node.setAttribute(this._attributeName, rawAttributeValue);
    let adjustment = newPartValue.length - oldPartValue.length
    this._end += adjustment;
    this._templateInstance.adjustAttributes(this, adjustment);
  }
}

//
// NodeTemplatePart class
//
class NodeTemplatePart extends TemplatePart {
  constructor(templateInstance, expression, node, start, end) {
    super(templateInstance, expression, node, start, end);
  }

  replaceWith(newPartValue) {
    if (newPartValue !== undefined) {
      let range = document.createRange();
      range.setStart(this._node, this._start);
      range.setEnd(this._node, this._end);

      if (newPartValue.length !== undefined) {
        // we were given a string
        if (this._node.nodeType == Node.TEXT_NODE) {
          // and we are inserting into a text node
          this._node.textContent =
              this._node.textContent.substring(0, this._start) +
              newPartValue +
              this._node.textContent.substring(this._end);

          let oldLength = this._end - this._start;
          let adjustment = newPartValue.length - oldLength;
          this._end += adjustment;
          this._templateInstance.adjustText(this, adjustment);
        } else {
          // and we are inserting into an element
          range.deleteContents();
          range.insertNode(new Text(newPartValue));
          this._end = range.endOffset;
        }
      } else {
        // we were given a node or a document fragment
        if (this._node.nodeType == Node.TEXT_NODE) {
          // and we are inserting into a text node
          let rangeToRight = document.createRange();
          rangeToRight.setStart(this._node, this._end);
          rangeToRight.setEnd(this._node, this._node.textContent.length);

          range.deleteContents();
          range.insertNode(newPartValue);
          this._node.parentElement.normalize();

          if (!rangeToRight.collapsed) {
            this._templateInstance.adjustTextInNewNode(
                this,
                rangeToRight.start.node,
                0 - this._end);
          }
        } else {
          // and we are inserting into an element node
          range.deleteContents();
          range.insertNode(newPartValue);
          this._node.parentElement.normalize();
        }
      }
    }
  }
}

//
// PartParser class
//
class PartParser {
  constructor(templateInstance) {
    this._templateInstance = templateInstance;
    this._partArray = [];
    this._internalTemplateNodeArray = [];

    this._findPartsInFragment(templateInstance.documentFragment);
  }

  get parts() {
    return this._partArray;
  }

  get internalTemplateNodes() {
    return this._internalTemplateNodeArray;
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
          this._internalTemplateNodeArray.push(node);
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
    for (let i = 0; i < attributeNames.length; i++) {
      let attributeName = attributeNames[i];
      let attributeValue = elementNode.getAttribute(attributeName);
      let part = PartParser._findNextPart(attributeValue);
      while (part != null) {
        this._partArray.push(
          new AttributeTemplatePart(this._templateInstance, part.id,
            elementNode, attributeName, part.start, part.end));
        part = PartParser._findNextPart(attributeValue, part.end);
      }
    }
  }

  _findPartsInTextNode(textNode) {
    let text = textNode.textContent;
    let part = PartParser._findNextPart(text);
    while (part != null) {
      this._partArray.push(
        new NodeTemplatePart(this._templateInstance, part.id, textNode,
            part.start, part.end));
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
