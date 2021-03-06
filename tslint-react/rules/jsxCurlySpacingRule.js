/**
 * @license
 * Copyright 2016 Palantir Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Lint = require("tslint");
var ts = require("typescript");
var OPTION_ALWAYS = "always";
var OPTION_NEVER = "never";
var SPACING_VALUES = [OPTION_ALWAYS, OPTION_NEVER];
var SPACING_OBJECT = {
    enum: SPACING_VALUES,
    type: "string",
};
var NEWLINE_REGEX = /\n/;
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        var walker = new JsxCurlySpacingWalker(sourceFile, this.getOptions());
        return this.applyWithWalker(walker);
    };
    return Rule;
}(Lint.Rules.AbstractRule));
/* tslint:disable:object-literal-sort-keys */
Rule.metadata = {
    ruleName: "jsx-curly-spacing",
    description: "Checks JSX curly braces spacing",
    optionsDescription: (_a = ["\n            One of the following two options must be provided:\n\n            * `\"", "\"` requires JSX attributes to have spaces between curly braces\n            * `\"", "\"` requires JSX attributes to NOT have spaces between curly braces"], _a.raw = ["\n            One of the following two options must be provided:\n\n            * \\`\"", "\"\\` requires JSX attributes to have spaces between curly braces\n            * \\`\"", "\"\\` requires JSX attributes to NOT have spaces between curly braces"], Lint.Utils.dedent(_a, OPTION_ALWAYS, OPTION_NEVER)),
    options: {
        type: "array",
        items: [SPACING_OBJECT],
        minLength: 1,
        maxLength: 1,
    },
    optionExamples: [
        "[true, \"" + OPTION_ALWAYS + "\"]",
        "[true, \"" + OPTION_NEVER + "\"]",
    ],
    type: "style",
    typescriptOnly: true,
};
/* tslint:enable:object-literal-sort-keys */
Rule.FAILURE_NO_ENDING_SPACE = function (tokenStr) {
    return "A space is required before " + tokenStr;
};
Rule.FAILURE_NO_BEGINNING_SPACE = function (tokenStr) {
    return "A space is required after " + tokenStr;
};
Rule.FAILURE_FORBIDDEN_SPACES_BEGINNING = function (tokenStr) {
    return "There should be no space after " + tokenStr;
};
Rule.FAILURE_FORBIDDEN_SPACES_END = function (tokenStr) {
    return "There should be no space before " + tokenStr;
};
exports.Rule = Rule;
var JsxCurlySpacingWalker = (function (_super) {
    __extends(JsxCurlySpacingWalker, _super);
    function JsxCurlySpacingWalker() {
        return _super.apply(this, arguments) || this;
    }
    JsxCurlySpacingWalker.prototype.visitJsxExpression = function (node) {
        this.validateBraceSpacing(node);
        _super.prototype.visitJsxExpression.call(this, node);
    };
    JsxCurlySpacingWalker.prototype.visitNode = function (node) {
        if (node.kind === ts.SyntaxKind.JsxSpreadAttribute) {
            this.validateBraceSpacing(node);
        }
        _super.prototype.visitNode.call(this, node);
    };
    JsxCurlySpacingWalker.prototype.validateBraceSpacing = function (node) {
        var firstToken = node.getFirstToken();
        var secondToken = node.getChildAt(1);
        var lastToken = node.getLastToken();
        var secondToLastToken = node.getChildAt(node.getChildCount() - 2);
        var nodeStart = node.getStart();
        var nodeWidth = node.getWidth();
        if (this.hasOption(OPTION_ALWAYS)) {
            var deleteFix = this.maybeGetDeleteFixForSpaceBetweenTokens(firstToken, secondToken);
            if (deleteFix === undefined) {
                var fix = new Lint.Fix(Rule.metadata.ruleName, [
                    this.appendText(secondToken.getFullStart(), " "),
                ]);
                var failureString = Rule.FAILURE_NO_BEGINNING_SPACE(firstToken.getText());
                this.addFailure(this.createFailure(nodeStart, 1, failureString, fix));
            }
            deleteFix = this.maybeGetDeleteFixForSpaceBetweenTokens(secondToLastToken, lastToken);
            if (deleteFix === undefined) {
                var fix = new Lint.Fix(Rule.metadata.ruleName, [
                    this.appendText(lastToken.getStart(), " "),
                ]);
                var failureString = Rule.FAILURE_NO_ENDING_SPACE(lastToken.getText());
                this.addFailure(this.createFailure(nodeStart + nodeWidth - 1, 1, failureString, fix));
            }
        }
        else if (this.hasOption(OPTION_NEVER)) {
            var firstAndSecondTokensCombinedText = getTokensCombinedText(firstToken, secondToken);
            var lastAndSecondToLastCombinedText = getTokensCombinedText(secondToLastToken, lastToken);
            if (!isExpressionMultiline(firstAndSecondTokensCombinedText)) {
                var fix = this.maybeGetDeleteFixForSpaceBetweenTokens(firstToken, secondToken);
                if (fix !== undefined) {
                    var failureString = Rule.FAILURE_FORBIDDEN_SPACES_BEGINNING(firstToken.getText());
                    this.addFailure(this.createFailure(nodeStart, 1, failureString, fix));
                }
            }
            if (!isExpressionMultiline(lastAndSecondToLastCombinedText)) {
                var fix = this.maybeGetDeleteFixForSpaceBetweenTokens(secondToLastToken, lastToken);
                if (fix !== undefined) {
                    var failureString = Rule.FAILURE_FORBIDDEN_SPACES_END(lastToken.getText());
                    // degenerate case when firstToken is the same as the secondToLastToken as we would
                    // have already queued up a fix in the previous branch, do not apply fix
                    var failure = firstToken === secondToLastToken
                        ? this.createFailure(nodeStart + nodeWidth - 1, 1, failureString)
                        : this.createFailure(nodeStart + nodeWidth - 1, 1, failureString, fix);
                    this.addFailure(failure);
                }
            }
        }
    };
    JsxCurlySpacingWalker.prototype.maybeGetDeleteFixForSpaceBetweenTokens = function (firstNode, secondNode) {
        if (firstNode.parent !== secondNode.parent) {
            throw Error("Expected identical parents for both nodes");
        }
        var parent = firstNode.parent;
        var parentStart = parent.getStart();
        var secondNodeStart = secondNode.getFullStart();
        var firstNodeEnd = firstNode.getStart() + firstNode.getWidth();
        var secondNodeRelativeStart = secondNodeStart - parentStart;
        var firstNodeRelativeEnd = firstNodeEnd - parentStart;
        var parentText = parent.getText();
        var trailingComments = ts.getTrailingCommentRanges(parentText, firstNodeRelativeEnd) || [];
        var leadingComments = ts.getLeadingCommentRanges(parentText, secondNodeRelativeStart) || [];
        var comments = trailingComments.concat(leadingComments);
        if (secondNode.getStart() - firstNode.getStart() - firstNode.getWidth() > getTotalCharCount(comments)) {
            var replacements = comments.map(function (comment) { return parentText.slice(comment.pos, comment.end); }).join("");
            return new Lint.Fix(Rule.metadata.ruleName, [
                this.createReplacement(secondNodeStart, secondNode.getStart() - secondNodeStart, replacements),
            ]);
        }
        else {
            return undefined;
        }
    };
    return JsxCurlySpacingWalker;
}(Lint.RuleWalker));
function isExpressionMultiline(text) {
    return NEWLINE_REGEX.test(text);
}
function getTokensCombinedText(firstToken, nextToken) {
    var parentNodeText = nextToken.parent.getText();
    var firstTokenText = firstToken.getText();
    var secondTokenText = nextToken.getText();
    var secondTokenTextLocation = parentNodeText.indexOf(secondTokenText);
    var firstTokenTextLocation = parentNodeText.indexOf(firstTokenText);
    var combinedTokeText = parentNodeText.slice(firstTokenTextLocation, secondTokenTextLocation + secondTokenText.length);
    return combinedTokeText;
}
function getTotalCharCount(comments) {
    return comments
        .map(function (comment) { return comment.end - comment.pos; })
        .reduce(function (l, r) { return l + r; }, 0);
}
var _a;
