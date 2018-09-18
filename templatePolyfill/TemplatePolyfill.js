// This will become HTMLTemplateElement.instantiate()
function HTMLTemplateElement_instantiate(thisTemplateElement, partProcessor, params) {
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
function TemplateInstance(documentFragment) {
    this.originalDocumentFragment = documentFragment;
    this.partArray = null;
    this.documentFragment = null;
}

TemplateInstance.prototype.documentFragment = function () {
    return this.documentFragment;
}

TemplateInstance.prototype.update = function (partProcessor, params) {
    this.documentFragment = this.originalDocumentFragment;
    let parser = new PartParser(this);
    this.partArray = parser.partArray;

    // process the parts in this template
    if (partProcessor == null) {
        partProcessor = this._defaultPartProcessor;
    }
    partProcessor(this.partArray, params);

    // process any imbedded templates
    let imbeddedTemplateArray = parser.imbeddedTemplateArray;
    imbeddedTemplateArray.forEach(template => {
        if (template.getAttribute('processor') == 'for-each') {
            let parent = template.parentElement;
            parent.removeChild(template);
            let items = params["items"];
            items.forEach(item => {
                let templateInstance = HTMLTemplateElement_instantiate(template, partProcessor, item);
                parent.appendChild(templateInstance.documentFragment);
            });
        } else {
            window.alert("The only type of embedded template we know is 'for-each'");
        }
    })
}

TemplateInstance.prototype._defaultPartProcessor = function (parts, params) {
    for (const part of parts) {
        if (part.attribute !== undefined) {
            part.replaceWith(params[part.expression]);
        } else if (part.parent !== undefined) {
            part.replaceWith(params[part.expression]);
        } else {
            window.alert("Unknown part type");
        }
    }
}

TemplateInstance.prototype._adjustAttributes = function (changingPart, adjustment) {
    for (const part of this.partArray) {
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

TemplateInstance.prototype._adjustText = function (changingPart, adjustment) {
    for (const part of this.partArray) {
        if (part != changingPart &&
            part.node == changingPart.node &&
            part.start >= changingPart.start) {
                // this is a part to the right of the changing one, fix it up
                part.start += adjustment;
                part.end += adjustment;
        }
    }
}

TemplateInstance.prototype._adjustTextInNewNode = function (changingPart,
    newNode, adjustment) {
    for (const part of this.partArray) {
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

//
// AttributeTemplatePart class
//
function AttributeTemplatePart(templateInstance, node, attributeName, expression, start, end) {
    this.templateInstance = templateInstance;
    this.node = node;
    this.attributeName = attributeName;
    this.expression = expression;
    this.start = start;
    this.end = end;
}

AttributeTemplatePart.prototype.expression = function () {
    return this.expression;
}

AttributeTemplatePart.prototype.value = function () {
    let attributeValue = this.node.getAttribute(this.attributeName);
    return attributeValue.substring(this.start, this.end);
}

AttributeTemplatePart.prototype.replaceWith = function (newValue) {
    let attributeValue = this.node.getAttribute(this.attributeName);
    let oldValue = this.value();
    if (newValue == undefined) {
        newValue = "";
    }
    attributeValue = attributeValue.substring(0, this.start) +
        newValue +
        attributeValue.substring(this.end);
    this.node.setAttribute(this.attributeName, attributeValue);
    let adjustment = newValue.length - oldValue.length
    this.end += adjustment;
    this.templateInstance._adjustAttributes(this, adjustment);
}

AttributeTemplatePart.prototype.attribute = function () {
    return this.attributeName;
}

//
// NodeTemplatePart class
//
function NodeTemplatePart(templateInstance, node, expression, start, end) {
    this.templateInstance = templateInstance;

    this.node = node;
    this.expression = expression;
    this.start = start;
    this.end = end;
}

NodeTemplatePart.prototype.expression = function () {
    return this.expression;
}

NodeTemplatePart.prototype.parent = function () {
    return this.node.parent;
}

NodeTemplatePart.prototype.replaceWith = function (newValue) {
    // insert the new value
    if (newValue !== undefined) {
        if (newValue.length !== undefined) {
            // we were given a string
            this.node.textContent = this.node.textContent.substring(0, this.start) +
                newValue +
                this.node.textContent.substring(this.end);

            let oldLength = this.end - this.start;
            let adjustment = newValue.length - oldLength;
            this.templateInstance._adjustText(this, adjustment);

        } else {
            // we were given a node or a document fragment
            let rangeToRight = document.createRange();
            rangeToRight.setStart(this.node, this.end);
            rangeToRight.setEnd(this.node, this.node.textContent.length);

            // remove old value (range will collapse)
            let range = document.createRange();
            range.setStart(this.node, this.start);
            range.setEnd(this.node, this.end);
            range.deleteContents();

            // insert the new nodes
            range.insertNode(newValue);
            this.node.parentElement.normalize();

            if (!rangeToRight.collapsed) {
                this.templateInstance._adjustTextInNewNode(
                    this,
                    rangeToRight.start.node,
                    0 - this.end);
            }
        }
    }
}

//
// PartParser class
//
function PartParser(templateInstance) {
    this.templateInstance = templateInstance;
    this.partArray = [];
    this.imbeddedTemplateArray = [];
    this._findPartsInFragment(templateInstance.documentFragment);
}

PartParser.prototype.partArray = function() {
    return this.partArray;
}

PartParser.prototype.imbeddedTemplateArray = function() {
    return this.imbeddedTemplateArray;
}

PartParser.prototype._findPartsInFragment = function (documentFragment) {
    for (let child = documentFragment.firstChild;
        child != null;
        child = child.nextSibling) {
        this._findPartsInTree(child);
    }
}

PartParser.prototype._findPartsInTree = function (root) {
    let walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    do {
        let node = walker.currentNode;
        if (node.nodeType == Node.ELEMENT_NODE) {
            this._findPartsInElementNode(node);
        } else if (node.nodeType == Node.TEXT_NODE) {
            this._findPartsInTextNode(node);
        }
    } while (walker.nextNode());
}

PartParser.prototype._findPartsInElementNode = function (elementNode) {
    let attributeNames = elementNode.getAttributeNames();
    for (let i = 0; i < attributeNames.length; i++) {
        let attributeName = attributeNames[i];
        let attributeValue = elementNode.getAttribute(attributeName);
        let part = this._findNextPart(attributeValue);
        while (part != null) {
            this.partArray.push(
                new AttributeTemplatePart(this.templateInstance, elementNode,
                    attributeName, part.id, part.start, part.end));

            part = this._findNextPart(attributeValue, part.end);
        }
    }
    if (elementNode.tagName == "TEMPLATE") {
        this.imbeddedTemplateArray.push(elementNode);
    }
}

PartParser.prototype._findPartsInTextNode = function (textNode) {
    let text = textNode.textContent;
    let part = this._findNextPart(text);
    while (part != null) {
        this.partArray.push(
            new NodeTemplatePart(this.templateInstance, textNode,
                part.id, part.start, part.end));

        part = this._findNextPart(text, part.end);
    }
}

// returns the gap before the starting {{ and the gap after the ending }}
// {start:#, end:#, id:string}
PartParser.prototype._findNextPart = function (string, base = 0) {
    let beforeOpenMustacheOffsetFromBase = string.substring(base).search("{{");
    if (beforeOpenMustacheOffsetFromBase != -1) {
        let beforeCloseMustacheOffsetFromBase = string.substring(base).search("}}");
        if (beforeCloseMustacheOffsetFromBase != -1) {
            return {
                start: beforeOpenMustacheOffsetFromBase + base,
                end: beforeCloseMustacheOffsetFromBase + base + 2,
                id: string.substring(
                    beforeOpenMustacheOffsetFromBase + base + 2,
                    beforeCloseMustacheOffsetFromBase + base
                )
            };
        }
    }
    return null;
}

