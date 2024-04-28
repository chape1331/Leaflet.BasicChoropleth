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
        //data: null,
        symetric: true, // Symetric around zero
        attributes: {},
        style: {},
        colors: ["red", "white", "green"],
        steps: 10,
        mode: 'e',
    },

    // variables for plugin scope
    _defaultAttributes: {
        id: "id",
        value: "value"
    },
    _defaultStyle: {
        color: "lightgray",
        colorSelected: "red",
        fillColor: "lightgray",
        weight: 2,
        weightSelected: 2,
        opacity: 1.0,
        fillOpacity: 1.0,
    },
    _selectedIds: [25],
    _colors: null,
    _limits: null,

    onAdd: function(map) {
        L.GeoJSON.prototype.onAdd.call(this, map);
        this.setStyle();
    },

    setStyle: function() {
        console.log(this);
        this._validateAttributes();
        this._validateStyles();
        this._generateColors();

        //let options = this.options;
        //let data = this.options.data;
        let attributes = this.options.attributes;
        let style = this.options.style;

        let layers = this._layers;

        for (let key in layers) {
            let layer = layers[key];
            let id = layer.feature.properties[attributes.id]; 
            let value = layer.feature.properties[attributes.value];
            let fillColor = this._getColor(value);
            let styleCopy = Object.assign({}, style);
            styleCopy.fillColor = fillColor;
            if (this._selectedIds.indexOf(id) > -1){
                styleCopy.color = style.colorSelected;
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
        if (style == null | style == undefined) style = Object.assign({}, this._defaultStyle);
        else {
            for (key in this._defaultStyle){
                if (!(key in style)) style[key] = this._defaultStyle[key];
            }
        }
    },

    _generateColors: function() {
        let options = this.options
        let data = this.options.data;
        let attribute = this.options.attributes.value;
        let values = [];

        for (key in data) {
            item = data[key];
            let value = item[attribute];
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

        this._colors = chroma.scale(options.colors).colors(options.steps);
        this._limits = chroma.limits(values, options.mode, options.steps);

        console.log(this._limits, this._colors);
    },

    /*updateData: function(data){
        this.options.data = data;
        this.setStyle();
    },*/

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
})

L.basicChoropleth = function(geojson, options){
    return new L.BasicChoropleth(geojson, options)
}

module.exports = L.basicChoropleth;