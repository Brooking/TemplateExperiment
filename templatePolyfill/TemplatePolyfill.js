let ZERO_WIDTH_SPACE='&#x200B';

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
        let parent = templateNode.parentElement;
        let templateRange = new Range();
        templateRange.setStartBefore(templateNode);
        templateRange.setEndAfter(templateNode);
        templateRange.deleteContents();
        let placeholder = new Text(ZERO_WIDTH_SPACE);
        templateRange.insertNode(placeholder);
        this._foreachTemplates.push({node: templateNode, range: templateRange,
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
      let templateNode = templateStruct.node;
      let range = templateStruct.range;
      let itemsKey = templateNode.getAttribute('items');
      itemsKey = itemsKey.substring(2, itemsKey.length - 2);
      let items = params[itemsKey];

      // walk them backwards because there is no range.append
      for (let i = items.length; i > 0; i--) {
        let item = items[i-1];
        let documentFragment = document.importNode(templateNode.content,
                                                   true/*deep*/);
        let newTemplateInstance = new TemplateInstance(documentFragment);
        newTemplateInstance.update(partProcessor, item);
        range.insertNode(newTemplateInstance.documentFragment);
      };

      if (items.length != 0 && templateStruct.placeholder) {
        templateStruct.placeholder.remove();
        templateStruct.placeholder = null;
      }
    })
  }

  static _defaultPartProcessor(parts, params) {
    for (const part of parts) {
      part.replaceWith(params[part.expression]);
    }
  }

  _adjustAttributes(changingPart, adjustment) {
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
}

//
// TemplatePart base class
//
class TemplatePart {
  constructor(templateInstance, expression) {
    this._templateInstance = templateInstance;
    this._expression = expression;
  }

  get expression() {
    return this._expression;
  }

}

//
// AttributeTemplatePart class
//
class AttributeTemplatePart extends TemplatePart {
  constructor(templateInstance, node, attributeName, expression, start, end) {
    super(templateInstance, expression);
    this._attributeName = attributeName;
    this._node = node;
    this._start = start;
    this._end = end;
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
    this._templateInstance._adjustAttributes(this, adjustment);
  }
}

//
// NodeTemplatePart class
//
class NodeTemplatePart extends TemplatePart {
  constructor(templateInstance, node, expression, start, end) {
    super(templateInstance, expression);
    this._range = new Range();
    this._range.setStart(node, start);
    this._range.setEnd(node, end);
  }

  // // get parent() {
  // //   return this._range.startContainer.parent;
  // // }

  replaceWith(newPartValue) {
    if (newPartValue.length === 0) {
      newPartValue = ZERO_WIDTH_SPACE;
    }

    if (newPartValue !== undefined) {
      let newNode = (newPartValue.length !== undefined) ?
                    new Text(newPartValue) :
                    newPartValue;
      this._range.deleteContents();
      let parent = this._range.startContainer;
      if (parent.nodeType === Node.TEXT_NODE) {
        parent = parent.parentElement;
      }
      this._range.insertNode(newNode);
      if (parent == null) {
        window.alert(this._range.startContainer);
      }
      parent.normalize();
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
          new AttributeTemplatePart(this._templateInstance, elementNode,
              attributeName, part.id, part.start, part.end));
        part = PartParser._findNextPart(attributeValue, part.end);
      }
    }
  }

  _findPartsInTextNode(textNode) {
    let text = textNode.textContent;
    let part = PartParser._findNextPart(text);
    while (part != null) {
      this._partArray.push(
        new NodeTemplatePart(this._templateInstance, textNode,
            part.id, part.start, part.end));
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
