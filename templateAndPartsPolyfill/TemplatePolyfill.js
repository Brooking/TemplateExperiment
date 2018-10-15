// This will become HTMLTemplateElement.instantiate(3 params)
function HTMLTemplateElement_instantiate(thisTemplateElement, partProcessor,
                                         params) {
  // instantiate the template
  let partedTemplate = HTMLTemplateElement_findParts(thisTemplateElement);
  let templateInstance = new TemplateInstance(partedTemplate);

  // stamp the template instance
  templateInstance.update(partProcessor, params);
  return templateInstance;
}

//
// TemplateInstance class
//
class TemplateInstance {
  constructor(partedTemplate) {
    this._partedTemplate = partedTemplate;
    this._internalTemplates = [];
    this._partArray = []

    // remove any internal templates, but keep track of where they go
    for (const partLocation of partedTemplate.partLocations) {
      if (partLocation instanceof TemplatePartLocation) {
        let templateNode = partLocation.node;
        let directive = templateNode.getAttribute('directive');
        if ( directive == 'for-each' || directive == 'if') {
          let placeholder = new Text("");
          templateNode.parentNode.replaceChild(placeholder, templateNode);
          this._internalTemplates.push({templateNode: templateNode,
                                      type: directive,
                                      firstNode: null,
                                      placeholder: placeholder});
        } else {
            window.alert(
              "The only type of embedded templates we know are " +
              "'for-each' and 'if' not '" + directive + "'");
        }
      } else {
        let part;
        if (partLocation instanceof AttributePartLocation) {
          part = new AttributeTemplatePart(this, partLocation.expression,
                                           partLocation.node,
                                           partLocation.attributeName,
                                           partLocation.start,
                                           partLocation.end);
        } else if (partLocation instanceof WholeAttributePartLocation) {
          part = new WholeAttributeTemplatePart(this, partLocation.expression,
                                                partLocation.node);
        } else if (partLocation instanceof NodePartLocation) {
          part = new NodeTemplatePart(this, partLocation.expression,
                                      partLocation.node,
                                      partLocation.start,
                                      partLocation.end);
        } else {
          window.alert("unknown partLocation type");
        }

        this._partArray.push(part);
      }
    }
  }

  get documentFragment() {
    return this._partedTemplate._documentFragment;
  }

  update(partProcessor, params) {
    // process the parts in this template
    if (this._partArray !== undefined) {
      if (partProcessor == null) {
        partProcessor = TemplateInstance.defaultPartProcessor;
      }
      partProcessor(this._partArray, params);
    }

    // insert new template instances (rows or conditionals)
    for (const templateStruct of this._internalTemplates) {
      let templateNode = templateStruct.templateNode;
      let placeholder = templateStruct.placeholder;
      let type = templateStruct.type;

      while (templateStruct.firstNode != null &&
             templateStruct.firstNode != placeholder) {
        let nodeToRemove = templateStruct.firstNode;
        templateStruct.firstNode = templateStruct.firstNode.nextSibling;
        nodeToRemove.parentNode.removeChild(nodeToRemove);
      }

      let startMarker = new Text("");
      placeholder.parentNode.insertBefore(startMarker, placeholder);

      if (type == 'if') {
        // this is an 'if' template
        let expression = templateNode.getAttribute('expression');

        // resolve any parts in the expression
        let base = 0;
        let ePart = PartParser._findNextPart(expression, 0);
        while(ePart != null) {
          let replacement = params[ePart.id];
          expression = expression.substring(0, ePart.start) +
                       replacement +
                       expression.substring(ePart.end);
          ePart = PartParser._findNextPart(expression, ePart.end);
        }

        // evaluate the expression
        if (eval(expression) == true) {
          let newTemplateInstance = HTMLTemplateElement_instantiate(
              templateNode,
              partProcessor,
              params);
          placeholder.parentNode.insertBefore(
              newTemplateInstance.documentFragment,
              placeholder);
        }
      } else {
        // this is a 'for-each' template
        let itemsKey = templateNode.getAttribute('items');
        if (itemsKey.substring(0,2) !== "{{") {
          window.alert("malformed part, missing start:" + itemsKey);
        } else if (itemsKey.substring(itemsKey.length - 2) !== "}}") {
          window.alert("malformed part, missing end:" + itemsKey);
        }
        itemsKey = itemsKey.substring(2, itemsKey.length - 2);
        let items;
        if (itemsKey == "") {
          items = params;
        } else {
          items = params[itemsKey];
        }

        for (const item of items) {
          let newTemplateInstance = HTMLTemplateElement_instantiate(
            templateNode,
            partProcessor,
            item);
          placeholder.parentNode.insertBefore(
              newTemplateInstance.documentFragment,
              placeholder);
        }
      }

      templateStruct.firstNode = startMarker.nextSibling;
      startMarker.parentNode.removeChild(startMarker);
    }
  }

  static defaultPartProcessor(parts, params) {
    for (const part of parts) {
      let property = false;
      let expression = part.expression;
      if (expression.substring(0,1) == '$') {
        // {{$xxx}} implies a property request
        property = true;
        expression = expression.substring(1);
      }

      let replacement;
      if (expression == "") {
        // use 'this'
        replacement = params;
      } else {
        // use 'this.expression'
        replacement = params[expression];
      }

      if (property) {
        // remove the attribute and add a property
        part.node.removeAttribute(part.attributeName);
        part.node[part.attributeName] = replacement;
      } else {
        // replace the property
        part.replaceWith(replacement);
      }
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

  get node() {
    return this._node;
  }

  set start(value) {
    this._start = value;
  }

  get start() {
    return this._start;
  }

  set end(value) {
    this._end = value;
  }

  get end() {
    return this._end;
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

  get attributeName() {
    return this._attributeName;
  }

  replaceWith(newPartValue) {
    let rawAttributeValue = this._node.getAttribute(this._attributeName);
    if (newPartValue == undefined) {
      newPartValue = "";
    }
    rawAttributeValue = rawAttributeValue.substring(0, this._start) +
      newPartValue +
      rawAttributeValue.substring(this._end);
    this._node.setAttribute(this._attributeName, rawAttributeValue);
    let adjustment = newPartValue.length - (this._end - this._start);
    this._end += adjustment;
    this._templateInstance.adjustAttributes(this, adjustment);
  }
}

//
// WholeAttributeTemplatePart class
//
class WholeAttributeTemplatePart extends TemplatePart {
  constructor(templateInstance, expression, node) {
    super(templateInstance, expression, node, 0, 0);
    this._node.removeAttribute("{{" + expression + "}}");
  }

  replaceWith(newPartValue) {
    // TODO currently a no-op
    // we should know what the attribute name is so that we can make or
    // delete it
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

      if (newPartValue.nodeType != undefined) {
        // we were given a node or a document fragment
        if (this._node.nodeType == Node.TEXT_NODE) {
          // and we are inserting into a text node
          let rangeToRight = document.createRange();
          rangeToRight.setStart(this._node, this._end);
          rangeToRight.setEnd(this._node, this._node.textContent.length);

          range.deleteContents();
          range.insertNode(newPartValue);
          this._node.parentNode.normalize();

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
          this._node.parentNode.normalize();
        }
      } else {
        // we were given a string (or something else that needs serializing)
        let newString = newPartValue.toString();
        if (this._node.nodeType == Node.TEXT_NODE) {
          // and we are inserting into a text node
          this._node.textContent =
              this._node.textContent.substring(0, this._start) +
              newString +
              this._node.textContent.substring(this._end);

          let oldLength = this._end - this._start;
          let adjustment = newString.length - oldLength;
          this._end += adjustment;
          this._templateInstance.adjustText(this, adjustment);
        } else {
          // and we are inserting into an element
          range.deleteContents();
          range.insertNode(new Text(newString));
          this._end = range.endOffset;
        }
      }
    }
  }
}

