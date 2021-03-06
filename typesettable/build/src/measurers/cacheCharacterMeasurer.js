/**
 * Copyright 2017-present Palantir Technologies, Inc. All rights reserved.
 * Licensed under the MIT License (the "License"); you may obtain a copy of the
 * license at https://github.com/palantir/typesettable/blob/develop/LICENSE
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var utils_1 = require("../utils");
var characterMeasurer_1 = require("./characterMeasurer");
var CacheCharacterMeasurer = (function (_super) {
    __extends(CacheCharacterMeasurer, _super);
    function CacheCharacterMeasurer(ruler, useGuards) {
        var _this = _super.call(this, ruler, useGuards) || this;
        _this.cache = new utils_1.Cache(function (c) {
            return _this._measureCharacterNotFromCache(c);
        });
        return _this;
    }
    CacheCharacterMeasurer.prototype._measureCharacterNotFromCache = function (c) {
        return _super.prototype._measureCharacter.call(this, c);
    };
    CacheCharacterMeasurer.prototype._measureCharacter = function (c) {
        return this.cache.get(c);
    };
    CacheCharacterMeasurer.prototype.reset = function () {
        this.cache.clear();
    };
    return CacheCharacterMeasurer;
}(characterMeasurer_1.CharacterMeasurer));
exports.CacheCharacterMeasurer = CacheCharacterMeasurer;
//# sourceMappingURL=cacheCharacterMeasurer.js.map