/**
 * class L.BasicChoropleth()
 * 
 * (extends L.GeoJSON)
 * 
 * <DESCRIPTION>
 * 
 */

var L = require("leaflet");
var chroma = require("chroma-js");

L.BasicChoropleth = L.GeoJSON.extend({
    options: {
        data: null,
        symetric: true, // Symetric around zero
        attributes: {},
        style: {},
        colors: ["red", "white", "green"],
        classes: 10,
        mode: 'e',
    },

    // variables for plugin scope
    _defaultAttributes: {
        id: "id",
        value: "value"
    },
    _defaultStyle: {
        color: "lightgray",
        colorSelected: ["red"],
        fillColor: "lightgray",
        fillColorNull: "lightgray",
        weight: 2,
        weightSelected: 2,
        opacity: 1.0,
        fillOpacity: 1.0,
    },
    _selectedIds: [],
    _colors: null,
    _limits: null,

    onAdd: function(map) {
        L.GeoJSON.prototype.onAdd.call(this, map);
        this.setStyle();
    },

    setStyle: function() {
        this._validateAttributes();
        this._validateStyles();
        this._generateColors();

        let attributes = this.options.attributes;
        let style = this.options.style;

        let layers = this._layers;
        for (let key in layers) {
            let layer = layers[key];
            let id = layer.feature.properties[attributes.id];
            let value = null;
            if (this.options.data == null) value = layer.feature.properties[attributes.value];            
            else value = this.options.data[id][attributes.value];
            let fillColor = style.fillColorNull;
            if (!(value == null)) fillColor = this._getColor(value);
            let styleCopy = Object.assign({}, style);
            styleCopy.fillColor = fillColor;

            var index = this._selectedIds.indexOf(id);
            if (index > -1){
                index = index % style.colorSelected.length;
                styleCopy.color = style.colorSelected[index];
                styleCopy.weight = style.weight * 2;
                styleCopy.opacity = 1.0;                
                layer.bringToFront();
            }
            layer.setStyle(styleCopy);
        }
    },

    _getColor(value) {
        let i = 0;
        while ((value > this._limits[i]) && ((i+2) < this._limits.length)) {
            i++;
        }
        return this._colors[i];
    },

    _validateAttributes: function() {
        let attributes = this.options.attributes;
        if (attributes == null | attributes == undefined) attributes = Object.assign({}, this._defaultAttributes);
        else {
            for (key in this._defaultAttributes){
                if (!(key in attributes)) attributes[key] = this._defaultAttributes[key];
            }
        }
    },

    _validateStyles: function() {
        let style = this.options.style;
        if (typeof(style.colorSelected) == "string") style.colorSelected = [style.colorSelected]

        if (style == null | style == undefined) style = Object.assign({}, this._defaultStyle);
        else {
            for (key in this._defaultStyle){
                if (!(key in style)) style[key] = this._defaultStyle[key];
            }
        }
    },

    _generateColors: function() {
        let options = this.options
        let attribute = this.options.attributes.value;
        let values = [];

        let layers = this._layers;
        for (key in layers) {
            let layer = layers[key];
            let value = layer.feature.properties[attribute];
            values.push(value);
        }

        if (options.symetric) {
            let min = Math.min(...values);
            let max = Math.max(...values);

            if ((min < 0) && (max > 0)){
                if (Math.abs(min) > Math.abs(max)) values.push(Math.abs(min));
                else values.push(-1 * max)
            }
        }

        this._colors = chroma.scale(options.colors).colors(options.classes);
        this._limits = chroma.limits(values, options.mode, options.classes);
    },

    updateData: function(data) {
        this.options.data = data;
        this.setStyle();
    },

    updateStyle: function(style){
        this.options.style = style;
        this.setStyle();
    },

    updateAttributes: function(attributes){
        this.options.attributes = attributes;
        this.setStyle();
    },

    selectFeature: function(id, clear=false) {
        if (clear) this.clearSelection();
        if (this._selectedIds.indexOf(id) == -1) {this._selectedIds.push(id)};

        this.setStyle();
    },

    unselectFeature: function(id) {
        const index = this._selectedIds.indexOf(id);
        if (index == -1) this._selectedIds.splice(index, 1);

        this.setStyle();
    },

    clearSelection: function() {
        delete(this._selectedIds);
        this._selectedIds = [];

        this.setStyle();
    },

    getSelected: function() {
        let selection = {};
        let style = this.options.style;

        for (i in this._selectedIds) {
            let item = this._selectedIds[i];
            let index = this._selectedIds.indexOf(item);
            index = index % style.colorSelected.length;
            selection[item] = style.colorSelected[index]; 
        }

        return selection;
    },
})

L.basicChoropleth = function(geojson, options){
    return new L.BasicChoropleth(geojson, options)
}

module.exports = L.basicChoropleth;