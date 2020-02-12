(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

// Stream object for reading off bytes from a byte array

function ByteStream(data){
	this.data = data;
	this.pos = 0;
}

// read the next byte off the stream
ByteStream.prototype.readByte = function(){
	return this.data[this.pos++];
};

// look at the next byte in the stream without updating the stream position
ByteStream.prototype.peekByte = function(){
	return this.data[this.pos];
};

// read an array of bytes
ByteStream.prototype.readBytes = function(n){
	var bytes = new Array(n);
	for(var i=0; i<n; i++){
		bytes[i] = this.readByte();
	}
	return bytes;
};

// peek at an array of bytes without updating the stream position
ByteStream.prototype.peekBytes = function(n){
	var bytes = new Array(n);
	for(var i=0; i<n; i++){
		bytes[i] = this.data[this.pos + i];
	}
	return bytes;
};

// read a string from a byte set
ByteStream.prototype.readString = function(len){
	var str = '';
	for(var i=0; i<len; i++){
		str += String.fromCharCode(this.readByte());
	}
	return str;
};

// read a single byte and return an array of bit booleans
ByteStream.prototype.readBitArray = function(){
	var arr = [];
	var bite = this.readByte();
	for (var i = 7; i >= 0; i--) {
		arr.push(!!(bite & (1 << i)));
	}
	return arr;
};

// read an unsigned int with endian option
ByteStream.prototype.readUnsigned = function(littleEndian){
	var a = this.readBytes(2);
	if(littleEndian){
		return (a[1] << 8) + a[0];	
	}else{
		return (a[0] << 8) + a[1];
	}	
};

module.exports = ByteStream;
},{}],2:[function(require,module,exports){

// Primary data parsing object used to parse byte arrays

var ByteStream = require('./bytestream');

function DataParser(data){
	this.stream = new ByteStream(data);
	// the final parsed object from the data
	this.output = {};
}

DataParser.prototype.parse = function(schema){
	// the top level schema is just the top level parts array
	this.parseParts(this.output, schema);	
	return this.output;
};

// parse a set of hierarchy parts providing the parent object, and the subschema
DataParser.prototype.parseParts = function(obj, schema){
	for(var i=0; i<schema.length; i++){
		var part = schema[i];
		this.parsePart(obj, part); 
	}
};

DataParser.prototype.parsePart = function(obj, part){
	var name = part.label;
	var value;

	// make sure the part meets any parse requirements
	if(part.requires && ! part.requires(this.stream, this.output, obj)){
		return;
	}
	
	if(part.loop){
		// create a parse loop over the parts
		var items = [];
		while(part.loop(this.stream)){
			var item = {};
			this.parseParts(item, part.parts);
			items.push(item);
		}
		obj[name] = items;
	}else if(part.parts){
		// process any child parts
		value = {};
		this.parseParts(value, part.parts);
		obj[name] = value;
	}else if(part.parser){
		// parse the value using a parser
		value = part.parser(this.stream, this.output, obj);
		if(!part.skip){
			obj[name] = value;
		}
	}else if(part.bits){
		// convert the next byte to a set of bit fields
		obj[name] = this.parseBits(part.bits);
	}
};

// combine bits to calculate value
function bitsToNum(bitArray){
	return bitArray.reduce(function(s, n) { return s * 2 + n; }, 0);
}

// parse a byte as a bit set (flags and values)
DataParser.prototype.parseBits = function(details){
	var out = {};
	var bits = this.stream.readBitArray();
	for(var key in details){
		var item = details[key];
		if(item.length){
			// convert the bit set to value
			out[key] = bitsToNum(bits.slice(item.index, item.index + item.length));
		}else{
			out[key] = bits[item.index];
		}
	}
	return out;
};

module.exports = DataParser;
},{"./bytestream":1}],3:[function(require,module,exports){

// a set of common parsers used with DataParser

var Parsers = {
	// read a byte
	readByte: function(){
		return function(stream){
			return stream.readByte();
		};
	},
	// read an array of bytes
	readBytes: function(length){
		return function(stream){
			return stream.readBytes(length);
		};
	},
	// read a string from bytes
	readString: function(length){
		return function(stream){
			return stream.readString(length);
		};
	},
	// read an unsigned int (with endian)
	readUnsigned: function(littleEndian){
		return function(stream){
			return stream.readUnsigned(littleEndian);
		};
	},
	// read an array of byte sets
	readArray: function(size, countFunc){
		return function(stream, obj, parent){
			var count = countFunc(stream, obj, parent);
			var arr = new Array(count);
			for(var i=0; i<count; i++){
				arr[i] = stream.readBytes(size);
			}
			return arr;
		};
	}
};

module.exports = Parsers;
},{}],4:[function(require,module,exports){
// export wrapper for exposing library

var GIF = window.GIF || {};

GIF = require('./gif');

window.GIF = GIF;
},{"./gif":5}],5:[function(require,module,exports){

// object used to represent array buffer data for a gif file

var DataParser = require('../bower_components/js-binary-schema-parser/src/dataparser');
var gifSchema = require('./schema');

function GIF(arrayBuffer){
	// convert to byte array
	var byteData = new Uint8Array(arrayBuffer);
	var parser = new DataParser(byteData);
	// parse the data
	this.raw = parser.parse(gifSchema);

	// set a flag to make sure the gif contains at least one image
	this.raw.hasImages = false;
	for(var f=0; f<this.raw.frames.length; f++){
		if(this.raw.frames[f].image){
			this.raw.hasImages = true;
			break;
		}
	}
}

// process a single gif image frames data, decompressing it using LZW 
// if buildPatch is true, the returned image will be a clamped 8 bit image patch
// for use directly with a canvas.
GIF.prototype.decompressFrame = function(index, buildPatch){

	// make sure a valid frame is requested
	if(index >= this.raw.frames.length){ return null; }

	var frame = this.raw.frames[index];
	if(frame.image){
		// get the number of pixels
		var totalPixels = frame.image.descriptor.width * frame.image.descriptor.height;

		// do lzw decompression
		var pixels = lzw(frame.image.data.minCodeSize, frame.image.data.blocks, totalPixels);

		// deal with interlacing if necessary
		if(frame.image.descriptor.lct.interlaced){
			pixels = deinterlace(pixels, frame.image.descriptor.width);
		}

		// setup usable image object
		var image = {
			pixels: pixels,
			dims: {
				top: frame.image.descriptor.top,
				left: frame.image.descriptor.left,
				width: frame.image.descriptor.width,
				height: frame.image.descriptor.height
			}
		};

		// color table
		if(frame.image.descriptor.lct && frame.image.descriptor.lct.exists){
			image.colorTable = frame.image.lct;
		}else{
			image.colorTable = this.raw.gct;
		}

		// add per frame relevant gce information
		if(frame.gce){
			image.delay = (frame.gce.delay || 10) * 10; // convert to ms
			image.disposalType = frame.gce.extras.disposal;
			// transparency
			if(frame.gce.extras.transparentColorGiven){
				image.transparentIndex = frame.gce.transparentColorIndex;
			}
		}

		// create canvas usable imagedata if desired
		if(buildPatch){
			image.patch = generatePatch(image);
		}

		return image;		
	}

	// frame does not contains image
	return null;


	/**
	 * javascript port of java LZW decompression
	 * Original java author url: https://gist.github.com/devunwired/4479231
	 */	
	function lzw(minCodeSize, data, pixelCount) {
 		
 		var MAX_STACK_SIZE = 4096;
		var nullCode = -1;

		var npix = pixelCount;
		var available, clear, code_mask, code_size, end_of_information, in_code, old_code, bits, code, i, datum, data_size, first, top, bi, pi;
 
 		var dstPixels = new Array(pixelCount);
		var prefix = new Array(MAX_STACK_SIZE);
		var suffix = new Array(MAX_STACK_SIZE);
		var pixelStack = new Array(MAX_STACK_SIZE + 1);
 
		// Initialize GIF data stream decoder.
		data_size = minCodeSize;
		clear = 1 << data_size;
		end_of_information = clear + 1;
		available = clear + 2;
		old_code = nullCode;
		code_size = data_size + 1;
		code_mask = (1 << code_size) - 1;
		for (code = 0; code < clear; code++) {
			prefix[code] = 0;
			suffix[code] = code;
		}
 
		// Decode GIF pixel stream.
		datum = bits = count = first = top = pi = bi = 0;
		for (i = 0; i < npix; ) {
			if (top === 0) {
				if (bits < code_size) {
					
					// get the next byte			
					datum += data[bi] << bits;

					bits += 8;
					bi++;
					continue;
				}
				// Get the next code.
				code = datum & code_mask;
				datum >>= code_size;
				bits -= code_size;
				// Interpret the code
				if ((code > available) || (code == end_of_information)) {
					break;
				}
				if (code == clear) {
					// Reset decoder.
					code_size = data_size + 1;
					code_mask = (1 << code_size) - 1;
					available = clear + 2;
					old_code = nullCode;
					continue;
				}
				if (old_code == nullCode) {
					pixelStack[top++] = suffix[code];
					old_code = code;
					first = code;
					continue;
				}
				in_code = code;
				if (code == available) {
					pixelStack[top++] = first;
					code = old_code;
				}
				while (code > clear) {
					pixelStack[top++] = suffix[code];
					code = prefix[code];
				}
				
				first = suffix[code] & 0xff;
				pixelStack[top++] = first;

				// add a new string to the table, but only if space is available
				// if not, just continue with current table until a clear code is found
				// (deferred clear code implementation as per GIF spec)
				if(available < MAX_STACK_SIZE){
					prefix[available] = old_code;
					suffix[available] = first;
					available++;
					if (((available & code_mask) === 0) && (available < MAX_STACK_SIZE)) {
						code_size++;
						code_mask += available;
					}
				}
				old_code = in_code;
			}
			// Pop a pixel off the pixel stack.
			top--;
			dstPixels[pi++] = pixelStack[top];
			i++;
		}

		for (i = pi; i < npix; i++) {
			dstPixels[i] = 0; // clear missing pixels
		}

		return dstPixels;
	}

	// deinterlace function from https://github.com/shachaf/jsgif
	function deinterlace(pixels, width) {
		
		var newPixels = new Array(pixels.length);
		var rows = pixels.length / width;
		var cpRow = function(toRow, fromRow) {
			var fromPixels = pixels.slice(fromRow * width, (fromRow + 1) * width);
			newPixels.splice.apply(newPixels, [toRow * width, width].concat(fromPixels));
		};

		// See appendix E.
		var offsets = [0,4,2,1];
		var steps   = [8,8,4,2];

		var fromRow = 0;
		for (var pass = 0; pass < 4; pass++) {
			for (var toRow = offsets[pass]; toRow < rows; toRow += steps[pass]) {
				cpRow(toRow, fromRow);
				fromRow++;
			}
		}

		return newPixels;
	}

	// create a clamped byte array patch for the frame image to be used directly with a canvas
	// TODO: could potentially squeeze some performance by doing a direct 32bit write per iteration
	function generatePatch(image){

		var totalPixels = image.pixels.length;
		var patchData = new Uint8ClampedArray(totalPixels * 4);
		for(var i=0; i<totalPixels; i++){
			var pos = i * 4;
			var colorIndex = image.pixels[i];
			var color = image.colorTable[colorIndex];
			patchData[pos] = color[0];
			patchData[pos + 1] = color[1];
			patchData[pos + 2] = color[2];
			patchData[pos + 3] = colorIndex !== image.transparentIndex ? 255 : 0;
		}

		return patchData;
	}
};

// returns all frames decompressed
GIF.prototype.decompressFrames = function(buildPatch){
	var frames = [];
	for(var i=0; i<this.raw.frames.length; i++){
		var frame = this.raw.frames[i];
		if(frame.image){
			frames.push(this.decompressFrame(i, buildPatch));
		}
	}
	return frames;
};

module.exports = GIF;
},{"../bower_components/js-binary-schema-parser/src/dataparser":2,"./schema":6}],6:[function(require,module,exports){

// Schema for the js file parser to use to parse gif files
// For js object convenience (re-use), the schema objects are approximately reverse ordered

// common parsers available
var Parsers = require('../bower_components/js-binary-schema-parser/src/parsers');

// a set of 0x00 terminated subblocks
var subBlocks = {
	label: 'blocks',
	parser: function(stream){
		var out = [];
		var terminator = 0x00;		
		for(var size=stream.readByte(); size!==terminator; size=stream.readByte()){
			out = out.concat(stream.readBytes(size));
		}
		return out;
	}
};

// global control extension
var gce = {
	label: 'gce',
	requires: function(stream){
		// just peek at the top two bytes, and if true do this
		var codes = stream.peekBytes(2);
		return codes[0] === 0x21 && codes[1] === 0xF9;
	},
	parts: [
		{ label: 'codes', parser: Parsers.readBytes(2), skip: true },
		{ label: 'byteSize', parser: Parsers.readByte() },
		{ label: 'extras', bits: {
			future: { index: 0, length: 3 },
			disposal: { index: 3, length: 3 },
			userInput: { index: 6 },
			transparentColorGiven: { index: 7 }
		}},
		{ label: 'delay', parser: Parsers.readUnsigned(true) },
		{ label: 'transparentColorIndex', parser: Parsers.readByte() },
		{ label: 'terminator', parser: Parsers.readByte(), skip: true }
	]
};

// image pipeline block
var image = {
	label: 'image',
	requires: function(stream){
		// peek at the next byte
		var code = stream.peekByte();
		return code === 0x2C;
	},
	parts: [
		{ label: 'code', parser: Parsers.readByte(), skip: true },
		{
			label: 'descriptor', // image descriptor
			parts: [
				{ label: 'left', parser: Parsers.readUnsigned(true) },
				{ label: 'top', parser: Parsers.readUnsigned(true) },
				{ label: 'width', parser: Parsers.readUnsigned(true) },
				{ label: 'height', parser: Parsers.readUnsigned(true) },
				{ label: 'lct', bits: {
					exists: { index: 0 },
					interlaced: { index: 1 },
					sort: { index: 2 },
					future: { index: 3, length: 2 },
					size: { index: 5, length: 3 }
				}}
			]
		},{
			label: 'lct', // optional local color table
			requires: function(stream, obj, parent){
				return parent.descriptor.lct.exists;
			},
			parser: Parsers.readArray(3, function(stream, obj, parent){
				return Math.pow(2, parent.descriptor.lct.size + 1);
			})
		},{
			label: 'data', // the image data blocks
			parts: [
				{ label: 'minCodeSize', parser: Parsers.readByte() },
				subBlocks
			]
		}
	]
};

// plain text block
var text = {
	label: 'text',
	requires: function(stream){
		// just peek at the top two bytes, and if true do this
		var codes = stream.peekBytes(2);
		return codes[0] === 0x21 && codes[1] === 0x01;
	},
	parts: [
		{ label: 'codes', parser: Parsers.readBytes(2), skip: true },
		{ label: 'blockSize', parser: Parsers.readByte() },
		{ 
			label: 'preData', 
			parser: function(stream, obj, parent){
				return stream.readBytes(parent.text.blockSize);
			}
		},
		subBlocks
	]
};

// application block
var application = {
	label: 'application',
	requires: function(stream, obj, parent){
		// make sure this frame doesn't already have a gce, text, comment, or image
		// as that means this block should be attached to the next frame
		//if(parent.gce || parent.text || parent.image || parent.comment){ return false; }

		// peek at the top two bytes
		var codes = stream.peekBytes(2);
		return codes[0] === 0x21 && codes[1] === 0xFF;
	},
	parts: [
		{ label: 'codes', parser: Parsers.readBytes(2), skip: true },
		{ label: 'blockSize', parser: Parsers.readByte() },
		{ 
			label: 'id', 
			parser: function(stream, obj, parent){
				return stream.readString(parent.blockSize);
			}
		},
		subBlocks
	]
};

// comment block
var comment = {
	label: 'comment',
	requires: function(stream, obj, parent){
		// make sure this frame doesn't already have a gce, text, comment, or image
		// as that means this block should be attached to the next frame
		//if(parent.gce || parent.text || parent.image || parent.comment){ return false; }

		// peek at the top two bytes
		var codes = stream.peekBytes(2);
		return codes[0] === 0x21 && codes[1] === 0xFE;
	},
	parts: [
		{ label: 'codes', parser: Parsers.readBytes(2), skip: true },
		subBlocks
	]
};

// frames of ext and image data
var frames = {
	label: 'frames',
	parts: [
		gce,
		application,
		comment,
		image,
		text
	],
	loop: function(stream){
		var nextCode = stream.peekByte();
		// rather than check for a terminator, we should check for the existence
		// of an ext or image block to avoid infinite loops
		//var terminator = 0x3B;
		//return nextCode !== terminator;
		return nextCode === 0x21 || nextCode === 0x2C;
	}
};

// main GIF schema
var schemaGIF = [
	{
		label: 'header', // gif header
		parts: [
			{ label: 'signature', parser: Parsers.readString(3) },
			{ label: 'version', parser: Parsers.readString(3) }
		]
	},{
		label: 'lsd', // local screen descriptor
		parts: [
			{ label: 'width', parser: Parsers.readUnsigned(true) },
			{ label: 'height', parser: Parsers.readUnsigned(true) },
			{ label: 'gct', bits: {
				exists: { index: 0 },
				resolution: { index: 1, length: 3 },
				sort: { index: 4 },
				size: { index: 5, length: 3 }
			}},
			{ label: 'backgroundColorIndex', parser: Parsers.readByte() },
			{ label: 'pixelAspectRatio', parser: Parsers.readByte() }
		]
	},{
		label: 'gct', // global color table
		requires: function(stream, obj){
			return obj.lsd.gct.exists;
		},
		parser: Parsers.readArray(3, function(stream, obj){
			return Math.pow(2, obj.lsd.gct.size + 1);
		})
	},
	frames // content frames
];

module.exports = schemaGIF;
},{"../bower_components/js-binary-schema-parser/src/parsers":3}]},{},[4])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJib3dlcl9jb21wb25lbnRzL2pzLWJpbmFyeS1zY2hlbWEtcGFyc2VyL3NyYy9ieXRlc3RyZWFtLmpzIiwiYm93ZXJfY29tcG9uZW50cy9qcy1iaW5hcnktc2NoZW1hLXBhcnNlci9zcmMvZGF0YXBhcnNlci5qcyIsImJvd2VyX2NvbXBvbmVudHMvanMtYmluYXJ5LXNjaGVtYS1wYXJzZXIvc3JjL3BhcnNlcnMuanMiLCJzcmMvZXhwb3J0cy5qcyIsInNyYy9naWYuanMiLCJzcmMvc2NoZW1hLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG4vLyBTdHJlYW0gb2JqZWN0IGZvciByZWFkaW5nIG9mZiBieXRlcyBmcm9tIGEgYnl0ZSBhcnJheVxuXG5mdW5jdGlvbiBCeXRlU3RyZWFtKGRhdGEpe1xuXHR0aGlzLmRhdGEgPSBkYXRhO1xuXHR0aGlzLnBvcyA9IDA7XG59XG5cbi8vIHJlYWQgdGhlIG5leHQgYnl0ZSBvZmYgdGhlIHN0cmVhbVxuQnl0ZVN0cmVhbS5wcm90b3R5cGUucmVhZEJ5dGUgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpcy5kYXRhW3RoaXMucG9zKytdO1xufTtcblxuLy8gbG9vayBhdCB0aGUgbmV4dCBieXRlIGluIHRoZSBzdHJlYW0gd2l0aG91dCB1cGRhdGluZyB0aGUgc3RyZWFtIHBvc2l0aW9uXG5CeXRlU3RyZWFtLnByb3RvdHlwZS5wZWVrQnl0ZSA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB0aGlzLmRhdGFbdGhpcy5wb3NdO1xufTtcblxuLy8gcmVhZCBhbiBhcnJheSBvZiBieXRlc1xuQnl0ZVN0cmVhbS5wcm90b3R5cGUucmVhZEJ5dGVzID0gZnVuY3Rpb24obil7XG5cdHZhciBieXRlcyA9IG5ldyBBcnJheShuKTtcblx0Zm9yKHZhciBpPTA7IGk8bjsgaSsrKXtcblx0XHRieXRlc1tpXSA9IHRoaXMucmVhZEJ5dGUoKTtcblx0fVxuXHRyZXR1cm4gYnl0ZXM7XG59O1xuXG4vLyBwZWVrIGF0IGFuIGFycmF5IG9mIGJ5dGVzIHdpdGhvdXQgdXBkYXRpbmcgdGhlIHN0cmVhbSBwb3NpdGlvblxuQnl0ZVN0cmVhbS5wcm90b3R5cGUucGVla0J5dGVzID0gZnVuY3Rpb24obil7XG5cdHZhciBieXRlcyA9IG5ldyBBcnJheShuKTtcblx0Zm9yKHZhciBpPTA7IGk8bjsgaSsrKXtcblx0XHRieXRlc1tpXSA9IHRoaXMuZGF0YVt0aGlzLnBvcyArIGldO1xuXHR9XG5cdHJldHVybiBieXRlcztcbn07XG5cbi8vIHJlYWQgYSBzdHJpbmcgZnJvbSBhIGJ5dGUgc2V0XG5CeXRlU3RyZWFtLnByb3RvdHlwZS5yZWFkU3RyaW5nID0gZnVuY3Rpb24obGVuKXtcblx0dmFyIHN0ciA9ICcnO1xuXHRmb3IodmFyIGk9MDsgaTxsZW47IGkrKyl7XG5cdFx0c3RyICs9IFN0cmluZy5mcm9tQ2hhckNvZGUodGhpcy5yZWFkQnl0ZSgpKTtcblx0fVxuXHRyZXR1cm4gc3RyO1xufTtcblxuLy8gcmVhZCBhIHNpbmdsZSBieXRlIGFuZCByZXR1cm4gYW4gYXJyYXkgb2YgYml0IGJvb2xlYW5zXG5CeXRlU3RyZWFtLnByb3RvdHlwZS5yZWFkQml0QXJyYXkgPSBmdW5jdGlvbigpe1xuXHR2YXIgYXJyID0gW107XG5cdHZhciBiaXRlID0gdGhpcy5yZWFkQnl0ZSgpO1xuXHRmb3IgKHZhciBpID0gNzsgaSA+PSAwOyBpLS0pIHtcblx0XHRhcnIucHVzaCghIShiaXRlICYgKDEgPDwgaSkpKTtcblx0fVxuXHRyZXR1cm4gYXJyO1xufTtcblxuLy8gcmVhZCBhbiB1bnNpZ25lZCBpbnQgd2l0aCBlbmRpYW4gb3B0aW9uXG5CeXRlU3RyZWFtLnByb3RvdHlwZS5yZWFkVW5zaWduZWQgPSBmdW5jdGlvbihsaXR0bGVFbmRpYW4pe1xuXHR2YXIgYSA9IHRoaXMucmVhZEJ5dGVzKDIpO1xuXHRpZihsaXR0bGVFbmRpYW4pe1xuXHRcdHJldHVybiAoYVsxXSA8PCA4KSArIGFbMF07XHRcblx0fWVsc2V7XG5cdFx0cmV0dXJuIChhWzBdIDw8IDgpICsgYVsxXTtcblx0fVx0XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJ5dGVTdHJlYW07IiwiXG4vLyBQcmltYXJ5IGRhdGEgcGFyc2luZyBvYmplY3QgdXNlZCB0byBwYXJzZSBieXRlIGFycmF5c1xuXG52YXIgQnl0ZVN0cmVhbSA9IHJlcXVpcmUoJy4vYnl0ZXN0cmVhbScpO1xuXG5mdW5jdGlvbiBEYXRhUGFyc2VyKGRhdGEpe1xuXHR0aGlzLnN0cmVhbSA9IG5ldyBCeXRlU3RyZWFtKGRhdGEpO1xuXHQvLyB0aGUgZmluYWwgcGFyc2VkIG9iamVjdCBmcm9tIHRoZSBkYXRhXG5cdHRoaXMub3V0cHV0ID0ge307XG59XG5cbkRhdGFQYXJzZXIucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24oc2NoZW1hKXtcblx0Ly8gdGhlIHRvcCBsZXZlbCBzY2hlbWEgaXMganVzdCB0aGUgdG9wIGxldmVsIHBhcnRzIGFycmF5XG5cdHRoaXMucGFyc2VQYXJ0cyh0aGlzLm91dHB1dCwgc2NoZW1hKTtcdFxuXHRyZXR1cm4gdGhpcy5vdXRwdXQ7XG59O1xuXG4vLyBwYXJzZSBhIHNldCBvZiBoaWVyYXJjaHkgcGFydHMgcHJvdmlkaW5nIHRoZSBwYXJlbnQgb2JqZWN0LCBhbmQgdGhlIHN1YnNjaGVtYVxuRGF0YVBhcnNlci5wcm90b3R5cGUucGFyc2VQYXJ0cyA9IGZ1bmN0aW9uKG9iaiwgc2NoZW1hKXtcblx0Zm9yKHZhciBpPTA7IGk8c2NoZW1hLmxlbmd0aDsgaSsrKXtcblx0XHR2YXIgcGFydCA9IHNjaGVtYVtpXTtcblx0XHR0aGlzLnBhcnNlUGFydChvYmosIHBhcnQpOyBcblx0fVxufTtcblxuRGF0YVBhcnNlci5wcm90b3R5cGUucGFyc2VQYXJ0ID0gZnVuY3Rpb24ob2JqLCBwYXJ0KXtcblx0dmFyIG5hbWUgPSBwYXJ0LmxhYmVsO1xuXHR2YXIgdmFsdWU7XG5cblx0Ly8gbWFrZSBzdXJlIHRoZSBwYXJ0IG1lZXRzIGFueSBwYXJzZSByZXF1aXJlbWVudHNcblx0aWYocGFydC5yZXF1aXJlcyAmJiAhIHBhcnQucmVxdWlyZXModGhpcy5zdHJlYW0sIHRoaXMub3V0cHV0LCBvYmopKXtcblx0XHRyZXR1cm47XG5cdH1cblx0XG5cdGlmKHBhcnQubG9vcCl7XG5cdFx0Ly8gY3JlYXRlIGEgcGFyc2UgbG9vcCBvdmVyIHRoZSBwYXJ0c1xuXHRcdHZhciBpdGVtcyA9IFtdO1xuXHRcdHdoaWxlKHBhcnQubG9vcCh0aGlzLnN0cmVhbSkpe1xuXHRcdFx0dmFyIGl0ZW0gPSB7fTtcblx0XHRcdHRoaXMucGFyc2VQYXJ0cyhpdGVtLCBwYXJ0LnBhcnRzKTtcblx0XHRcdGl0ZW1zLnB1c2goaXRlbSk7XG5cdFx0fVxuXHRcdG9ialtuYW1lXSA9IGl0ZW1zO1xuXHR9ZWxzZSBpZihwYXJ0LnBhcnRzKXtcblx0XHQvLyBwcm9jZXNzIGFueSBjaGlsZCBwYXJ0c1xuXHRcdHZhbHVlID0ge307XG5cdFx0dGhpcy5wYXJzZVBhcnRzKHZhbHVlLCBwYXJ0LnBhcnRzKTtcblx0XHRvYmpbbmFtZV0gPSB2YWx1ZTtcblx0fWVsc2UgaWYocGFydC5wYXJzZXIpe1xuXHRcdC8vIHBhcnNlIHRoZSB2YWx1ZSB1c2luZyBhIHBhcnNlclxuXHRcdHZhbHVlID0gcGFydC5wYXJzZXIodGhpcy5zdHJlYW0sIHRoaXMub3V0cHV0LCBvYmopO1xuXHRcdGlmKCFwYXJ0LnNraXApe1xuXHRcdFx0b2JqW25hbWVdID0gdmFsdWU7XG5cdFx0fVxuXHR9ZWxzZSBpZihwYXJ0LmJpdHMpe1xuXHRcdC8vIGNvbnZlcnQgdGhlIG5leHQgYnl0ZSB0byBhIHNldCBvZiBiaXQgZmllbGRzXG5cdFx0b2JqW25hbWVdID0gdGhpcy5wYXJzZUJpdHMocGFydC5iaXRzKTtcblx0fVxufTtcblxuLy8gY29tYmluZSBiaXRzIHRvIGNhbGN1bGF0ZSB2YWx1ZVxuZnVuY3Rpb24gYml0c1RvTnVtKGJpdEFycmF5KXtcblx0cmV0dXJuIGJpdEFycmF5LnJlZHVjZShmdW5jdGlvbihzLCBuKSB7IHJldHVybiBzICogMiArIG47IH0sIDApO1xufVxuXG4vLyBwYXJzZSBhIGJ5dGUgYXMgYSBiaXQgc2V0IChmbGFncyBhbmQgdmFsdWVzKVxuRGF0YVBhcnNlci5wcm90b3R5cGUucGFyc2VCaXRzID0gZnVuY3Rpb24oZGV0YWlscyl7XG5cdHZhciBvdXQgPSB7fTtcblx0dmFyIGJpdHMgPSB0aGlzLnN0cmVhbS5yZWFkQml0QXJyYXkoKTtcblx0Zm9yKHZhciBrZXkgaW4gZGV0YWlscyl7XG5cdFx0dmFyIGl0ZW0gPSBkZXRhaWxzW2tleV07XG5cdFx0aWYoaXRlbS5sZW5ndGgpe1xuXHRcdFx0Ly8gY29udmVydCB0aGUgYml0IHNldCB0byB2YWx1ZVxuXHRcdFx0b3V0W2tleV0gPSBiaXRzVG9OdW0oYml0cy5zbGljZShpdGVtLmluZGV4LCBpdGVtLmluZGV4ICsgaXRlbS5sZW5ndGgpKTtcblx0XHR9ZWxzZXtcblx0XHRcdG91dFtrZXldID0gYml0c1tpdGVtLmluZGV4XTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIG91dDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRGF0YVBhcnNlcjsiLCJcbi8vIGEgc2V0IG9mIGNvbW1vbiBwYXJzZXJzIHVzZWQgd2l0aCBEYXRhUGFyc2VyXG5cbnZhciBQYXJzZXJzID0ge1xuXHQvLyByZWFkIGEgYnl0ZVxuXHRyZWFkQnl0ZTogZnVuY3Rpb24oKXtcblx0XHRyZXR1cm4gZnVuY3Rpb24oc3RyZWFtKXtcblx0XHRcdHJldHVybiBzdHJlYW0ucmVhZEJ5dGUoKTtcblx0XHR9O1xuXHR9LFxuXHQvLyByZWFkIGFuIGFycmF5IG9mIGJ5dGVzXG5cdHJlYWRCeXRlczogZnVuY3Rpb24obGVuZ3RoKXtcblx0XHRyZXR1cm4gZnVuY3Rpb24oc3RyZWFtKXtcblx0XHRcdHJldHVybiBzdHJlYW0ucmVhZEJ5dGVzKGxlbmd0aCk7XG5cdFx0fTtcblx0fSxcblx0Ly8gcmVhZCBhIHN0cmluZyBmcm9tIGJ5dGVzXG5cdHJlYWRTdHJpbmc6IGZ1bmN0aW9uKGxlbmd0aCl7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKHN0cmVhbSl7XG5cdFx0XHRyZXR1cm4gc3RyZWFtLnJlYWRTdHJpbmcobGVuZ3RoKTtcblx0XHR9O1xuXHR9LFxuXHQvLyByZWFkIGFuIHVuc2lnbmVkIGludCAod2l0aCBlbmRpYW4pXG5cdHJlYWRVbnNpZ25lZDogZnVuY3Rpb24obGl0dGxlRW5kaWFuKXtcblx0XHRyZXR1cm4gZnVuY3Rpb24oc3RyZWFtKXtcblx0XHRcdHJldHVybiBzdHJlYW0ucmVhZFVuc2lnbmVkKGxpdHRsZUVuZGlhbik7XG5cdFx0fTtcblx0fSxcblx0Ly8gcmVhZCBhbiBhcnJheSBvZiBieXRlIHNldHNcblx0cmVhZEFycmF5OiBmdW5jdGlvbihzaXplLCBjb3VudEZ1bmMpe1xuXHRcdHJldHVybiBmdW5jdGlvbihzdHJlYW0sIG9iaiwgcGFyZW50KXtcblx0XHRcdHZhciBjb3VudCA9IGNvdW50RnVuYyhzdHJlYW0sIG9iaiwgcGFyZW50KTtcblx0XHRcdHZhciBhcnIgPSBuZXcgQXJyYXkoY291bnQpO1xuXHRcdFx0Zm9yKHZhciBpPTA7IGk8Y291bnQ7IGkrKyl7XG5cdFx0XHRcdGFycltpXSA9IHN0cmVhbS5yZWFkQnl0ZXMoc2l6ZSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gYXJyO1xuXHRcdH07XG5cdH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUGFyc2VyczsiLCIvLyBleHBvcnQgd3JhcHBlciBmb3IgZXhwb3NpbmcgbGlicmFyeVxuXG52YXIgR0lGID0gd2luZG93LkdJRiB8fCB7fTtcblxuR0lGID0gcmVxdWlyZSgnLi9naWYnKTtcblxud2luZG93LkdJRiA9IEdJRjsiLCJcbi8vIG9iamVjdCB1c2VkIHRvIHJlcHJlc2VudCBhcnJheSBidWZmZXIgZGF0YSBmb3IgYSBnaWYgZmlsZVxuXG52YXIgRGF0YVBhcnNlciA9IHJlcXVpcmUoJy4uL2Jvd2VyX2NvbXBvbmVudHMvanMtYmluYXJ5LXNjaGVtYS1wYXJzZXIvc3JjL2RhdGFwYXJzZXInKTtcbnZhciBnaWZTY2hlbWEgPSByZXF1aXJlKCcuL3NjaGVtYScpO1xuXG5mdW5jdGlvbiBHSUYoYXJyYXlCdWZmZXIpe1xuXHQvLyBjb252ZXJ0IHRvIGJ5dGUgYXJyYXlcblx0dmFyIGJ5dGVEYXRhID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXlCdWZmZXIpO1xuXHR2YXIgcGFyc2VyID0gbmV3IERhdGFQYXJzZXIoYnl0ZURhdGEpO1xuXHQvLyBwYXJzZSB0aGUgZGF0YVxuXHR0aGlzLnJhdyA9IHBhcnNlci5wYXJzZShnaWZTY2hlbWEpO1xuXG5cdC8vIHNldCBhIGZsYWcgdG8gbWFrZSBzdXJlIHRoZSBnaWYgY29udGFpbnMgYXQgbGVhc3Qgb25lIGltYWdlXG5cdHRoaXMucmF3Lmhhc0ltYWdlcyA9IGZhbHNlO1xuXHRmb3IodmFyIGY9MDsgZjx0aGlzLnJhdy5mcmFtZXMubGVuZ3RoOyBmKyspe1xuXHRcdGlmKHRoaXMucmF3LmZyYW1lc1tmXS5pbWFnZSl7XG5cdFx0XHR0aGlzLnJhdy5oYXNJbWFnZXMgPSB0cnVlO1xuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG59XG5cbi8vIHByb2Nlc3MgYSBzaW5nbGUgZ2lmIGltYWdlIGZyYW1lcyBkYXRhLCBkZWNvbXByZXNzaW5nIGl0IHVzaW5nIExaVyBcbi8vIGlmIGJ1aWxkUGF0Y2ggaXMgdHJ1ZSwgdGhlIHJldHVybmVkIGltYWdlIHdpbGwgYmUgYSBjbGFtcGVkIDggYml0IGltYWdlIHBhdGNoXG4vLyBmb3IgdXNlIGRpcmVjdGx5IHdpdGggYSBjYW52YXMuXG5HSUYucHJvdG90eXBlLmRlY29tcHJlc3NGcmFtZSA9IGZ1bmN0aW9uKGluZGV4LCBidWlsZFBhdGNoKXtcblxuXHQvLyBtYWtlIHN1cmUgYSB2YWxpZCBmcmFtZSBpcyByZXF1ZXN0ZWRcblx0aWYoaW5kZXggPj0gdGhpcy5yYXcuZnJhbWVzLmxlbmd0aCl7IHJldHVybiBudWxsOyB9XG5cblx0dmFyIGZyYW1lID0gdGhpcy5yYXcuZnJhbWVzW2luZGV4XTtcblx0aWYoZnJhbWUuaW1hZ2Upe1xuXHRcdC8vIGdldCB0aGUgbnVtYmVyIG9mIHBpeGVsc1xuXHRcdHZhciB0b3RhbFBpeGVscyA9IGZyYW1lLmltYWdlLmRlc2NyaXB0b3Iud2lkdGggKiBmcmFtZS5pbWFnZS5kZXNjcmlwdG9yLmhlaWdodDtcblxuXHRcdC8vIGRvIGx6dyBkZWNvbXByZXNzaW9uXG5cdFx0dmFyIHBpeGVscyA9IGx6dyhmcmFtZS5pbWFnZS5kYXRhLm1pbkNvZGVTaXplLCBmcmFtZS5pbWFnZS5kYXRhLmJsb2NrcywgdG90YWxQaXhlbHMpO1xuXG5cdFx0Ly8gZGVhbCB3aXRoIGludGVybGFjaW5nIGlmIG5lY2Vzc2FyeVxuXHRcdGlmKGZyYW1lLmltYWdlLmRlc2NyaXB0b3IubGN0LmludGVybGFjZWQpe1xuXHRcdFx0cGl4ZWxzID0gZGVpbnRlcmxhY2UocGl4ZWxzLCBmcmFtZS5pbWFnZS5kZXNjcmlwdG9yLndpZHRoKTtcblx0XHR9XG5cblx0XHQvLyBzZXR1cCB1c2FibGUgaW1hZ2Ugb2JqZWN0XG5cdFx0dmFyIGltYWdlID0ge1xuXHRcdFx0cGl4ZWxzOiBwaXhlbHMsXG5cdFx0XHRkaW1zOiB7XG5cdFx0XHRcdHRvcDogZnJhbWUuaW1hZ2UuZGVzY3JpcHRvci50b3AsXG5cdFx0XHRcdGxlZnQ6IGZyYW1lLmltYWdlLmRlc2NyaXB0b3IubGVmdCxcblx0XHRcdFx0d2lkdGg6IGZyYW1lLmltYWdlLmRlc2NyaXB0b3Iud2lkdGgsXG5cdFx0XHRcdGhlaWdodDogZnJhbWUuaW1hZ2UuZGVzY3JpcHRvci5oZWlnaHRcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0Ly8gY29sb3IgdGFibGVcblx0XHRpZihmcmFtZS5pbWFnZS5kZXNjcmlwdG9yLmxjdCAmJiBmcmFtZS5pbWFnZS5kZXNjcmlwdG9yLmxjdC5leGlzdHMpe1xuXHRcdFx0aW1hZ2UuY29sb3JUYWJsZSA9IGZyYW1lLmltYWdlLmxjdDtcblx0XHR9ZWxzZXtcblx0XHRcdGltYWdlLmNvbG9yVGFibGUgPSB0aGlzLnJhdy5nY3Q7XG5cdFx0fVxuXG5cdFx0Ly8gYWRkIHBlciBmcmFtZSByZWxldmFudCBnY2UgaW5mb3JtYXRpb25cblx0XHRpZihmcmFtZS5nY2Upe1xuXHRcdFx0aW1hZ2UuZGVsYXkgPSAoZnJhbWUuZ2NlLmRlbGF5IHx8IDEwKSAqIDEwOyAvLyBjb252ZXJ0IHRvIG1zXG5cdFx0XHRpbWFnZS5kaXNwb3NhbFR5cGUgPSBmcmFtZS5nY2UuZXh0cmFzLmRpc3Bvc2FsO1xuXHRcdFx0Ly8gdHJhbnNwYXJlbmN5XG5cdFx0XHRpZihmcmFtZS5nY2UuZXh0cmFzLnRyYW5zcGFyZW50Q29sb3JHaXZlbil7XG5cdFx0XHRcdGltYWdlLnRyYW5zcGFyZW50SW5kZXggPSBmcmFtZS5nY2UudHJhbnNwYXJlbnRDb2xvckluZGV4O1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIGNyZWF0ZSBjYW52YXMgdXNhYmxlIGltYWdlZGF0YSBpZiBkZXNpcmVkXG5cdFx0aWYoYnVpbGRQYXRjaCl7XG5cdFx0XHRpbWFnZS5wYXRjaCA9IGdlbmVyYXRlUGF0Y2goaW1hZ2UpO1xuXHRcdH1cblxuXHRcdHJldHVybiBpbWFnZTtcdFx0XG5cdH1cblxuXHQvLyBmcmFtZSBkb2VzIG5vdCBjb250YWlucyBpbWFnZVxuXHRyZXR1cm4gbnVsbDtcblxuXG5cdC8qKlxuXHQgKiBqYXZhc2NyaXB0IHBvcnQgb2YgamF2YSBMWlcgZGVjb21wcmVzc2lvblxuXHQgKiBPcmlnaW5hbCBqYXZhIGF1dGhvciB1cmw6IGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL2RldnVud2lyZWQvNDQ3OTIzMVxuXHQgKi9cdFxuXHRmdW5jdGlvbiBsencobWluQ29kZVNpemUsIGRhdGEsIHBpeGVsQ291bnQpIHtcbiBcdFx0XG4gXHRcdHZhciBNQVhfU1RBQ0tfU0laRSA9IDQwOTY7XG5cdFx0dmFyIG51bGxDb2RlID0gLTE7XG5cblx0XHR2YXIgbnBpeCA9IHBpeGVsQ291bnQ7XG5cdFx0dmFyIGF2YWlsYWJsZSwgY2xlYXIsIGNvZGVfbWFzaywgY29kZV9zaXplLCBlbmRfb2ZfaW5mb3JtYXRpb24sIGluX2NvZGUsIG9sZF9jb2RlLCBiaXRzLCBjb2RlLCBpLCBkYXR1bSwgZGF0YV9zaXplLCBmaXJzdCwgdG9wLCBiaSwgcGk7XG4gXG4gXHRcdHZhciBkc3RQaXhlbHMgPSBuZXcgQXJyYXkocGl4ZWxDb3VudCk7XG5cdFx0dmFyIHByZWZpeCA9IG5ldyBBcnJheShNQVhfU1RBQ0tfU0laRSk7XG5cdFx0dmFyIHN1ZmZpeCA9IG5ldyBBcnJheShNQVhfU1RBQ0tfU0laRSk7XG5cdFx0dmFyIHBpeGVsU3RhY2sgPSBuZXcgQXJyYXkoTUFYX1NUQUNLX1NJWkUgKyAxKTtcbiBcblx0XHQvLyBJbml0aWFsaXplIEdJRiBkYXRhIHN0cmVhbSBkZWNvZGVyLlxuXHRcdGRhdGFfc2l6ZSA9IG1pbkNvZGVTaXplO1xuXHRcdGNsZWFyID0gMSA8PCBkYXRhX3NpemU7XG5cdFx0ZW5kX29mX2luZm9ybWF0aW9uID0gY2xlYXIgKyAxO1xuXHRcdGF2YWlsYWJsZSA9IGNsZWFyICsgMjtcblx0XHRvbGRfY29kZSA9IG51bGxDb2RlO1xuXHRcdGNvZGVfc2l6ZSA9IGRhdGFfc2l6ZSArIDE7XG5cdFx0Y29kZV9tYXNrID0gKDEgPDwgY29kZV9zaXplKSAtIDE7XG5cdFx0Zm9yIChjb2RlID0gMDsgY29kZSA8IGNsZWFyOyBjb2RlKyspIHtcblx0XHRcdHByZWZpeFtjb2RlXSA9IDA7XG5cdFx0XHRzdWZmaXhbY29kZV0gPSBjb2RlO1xuXHRcdH1cbiBcblx0XHQvLyBEZWNvZGUgR0lGIHBpeGVsIHN0cmVhbS5cblx0XHRkYXR1bSA9IGJpdHMgPSBjb3VudCA9IGZpcnN0ID0gdG9wID0gcGkgPSBiaSA9IDA7XG5cdFx0Zm9yIChpID0gMDsgaSA8IG5waXg7ICkge1xuXHRcdFx0aWYgKHRvcCA9PT0gMCkge1xuXHRcdFx0XHRpZiAoYml0cyA8IGNvZGVfc2l6ZSkge1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdC8vIGdldCB0aGUgbmV4dCBieXRlXHRcdFx0XG5cdFx0XHRcdFx0ZGF0dW0gKz0gZGF0YVtiaV0gPDwgYml0cztcblxuXHRcdFx0XHRcdGJpdHMgKz0gODtcblx0XHRcdFx0XHRiaSsrO1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIEdldCB0aGUgbmV4dCBjb2RlLlxuXHRcdFx0XHRjb2RlID0gZGF0dW0gJiBjb2RlX21hc2s7XG5cdFx0XHRcdGRhdHVtID4+PSBjb2RlX3NpemU7XG5cdFx0XHRcdGJpdHMgLT0gY29kZV9zaXplO1xuXHRcdFx0XHQvLyBJbnRlcnByZXQgdGhlIGNvZGVcblx0XHRcdFx0aWYgKChjb2RlID4gYXZhaWxhYmxlKSB8fCAoY29kZSA9PSBlbmRfb2ZfaW5mb3JtYXRpb24pKSB7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGNvZGUgPT0gY2xlYXIpIHtcblx0XHRcdFx0XHQvLyBSZXNldCBkZWNvZGVyLlxuXHRcdFx0XHRcdGNvZGVfc2l6ZSA9IGRhdGFfc2l6ZSArIDE7XG5cdFx0XHRcdFx0Y29kZV9tYXNrID0gKDEgPDwgY29kZV9zaXplKSAtIDE7XG5cdFx0XHRcdFx0YXZhaWxhYmxlID0gY2xlYXIgKyAyO1xuXHRcdFx0XHRcdG9sZF9jb2RlID0gbnVsbENvZGU7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKG9sZF9jb2RlID09IG51bGxDb2RlKSB7XG5cdFx0XHRcdFx0cGl4ZWxTdGFja1t0b3ArK10gPSBzdWZmaXhbY29kZV07XG5cdFx0XHRcdFx0b2xkX2NvZGUgPSBjb2RlO1xuXHRcdFx0XHRcdGZpcnN0ID0gY29kZTtcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpbl9jb2RlID0gY29kZTtcblx0XHRcdFx0aWYgKGNvZGUgPT0gYXZhaWxhYmxlKSB7XG5cdFx0XHRcdFx0cGl4ZWxTdGFja1t0b3ArK10gPSBmaXJzdDtcblx0XHRcdFx0XHRjb2RlID0gb2xkX2NvZGU7XG5cdFx0XHRcdH1cblx0XHRcdFx0d2hpbGUgKGNvZGUgPiBjbGVhcikge1xuXHRcdFx0XHRcdHBpeGVsU3RhY2tbdG9wKytdID0gc3VmZml4W2NvZGVdO1xuXHRcdFx0XHRcdGNvZGUgPSBwcmVmaXhbY29kZV07XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdGZpcnN0ID0gc3VmZml4W2NvZGVdICYgMHhmZjtcblx0XHRcdFx0cGl4ZWxTdGFja1t0b3ArK10gPSBmaXJzdDtcblxuXHRcdFx0XHQvLyBhZGQgYSBuZXcgc3RyaW5nIHRvIHRoZSB0YWJsZSwgYnV0IG9ubHkgaWYgc3BhY2UgaXMgYXZhaWxhYmxlXG5cdFx0XHRcdC8vIGlmIG5vdCwganVzdCBjb250aW51ZSB3aXRoIGN1cnJlbnQgdGFibGUgdW50aWwgYSBjbGVhciBjb2RlIGlzIGZvdW5kXG5cdFx0XHRcdC8vIChkZWZlcnJlZCBjbGVhciBjb2RlIGltcGxlbWVudGF0aW9uIGFzIHBlciBHSUYgc3BlYylcblx0XHRcdFx0aWYoYXZhaWxhYmxlIDwgTUFYX1NUQUNLX1NJWkUpe1xuXHRcdFx0XHRcdHByZWZpeFthdmFpbGFibGVdID0gb2xkX2NvZGU7XG5cdFx0XHRcdFx0c3VmZml4W2F2YWlsYWJsZV0gPSBmaXJzdDtcblx0XHRcdFx0XHRhdmFpbGFibGUrKztcblx0XHRcdFx0XHRpZiAoKChhdmFpbGFibGUgJiBjb2RlX21hc2spID09PSAwKSAmJiAoYXZhaWxhYmxlIDwgTUFYX1NUQUNLX1NJWkUpKSB7XG5cdFx0XHRcdFx0XHRjb2RlX3NpemUrKztcblx0XHRcdFx0XHRcdGNvZGVfbWFzayArPSBhdmFpbGFibGU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdG9sZF9jb2RlID0gaW5fY29kZTtcblx0XHRcdH1cblx0XHRcdC8vIFBvcCBhIHBpeGVsIG9mZiB0aGUgcGl4ZWwgc3RhY2suXG5cdFx0XHR0b3AtLTtcblx0XHRcdGRzdFBpeGVsc1twaSsrXSA9IHBpeGVsU3RhY2tbdG9wXTtcblx0XHRcdGkrKztcblx0XHR9XG5cblx0XHRmb3IgKGkgPSBwaTsgaSA8IG5waXg7IGkrKykge1xuXHRcdFx0ZHN0UGl4ZWxzW2ldID0gMDsgLy8gY2xlYXIgbWlzc2luZyBwaXhlbHNcblx0XHR9XG5cblx0XHRyZXR1cm4gZHN0UGl4ZWxzO1xuXHR9XG5cblx0Ly8gZGVpbnRlcmxhY2UgZnVuY3Rpb24gZnJvbSBodHRwczovL2dpdGh1Yi5jb20vc2hhY2hhZi9qc2dpZlxuXHRmdW5jdGlvbiBkZWludGVybGFjZShwaXhlbHMsIHdpZHRoKSB7XG5cdFx0XG5cdFx0dmFyIG5ld1BpeGVscyA9IG5ldyBBcnJheShwaXhlbHMubGVuZ3RoKTtcblx0XHR2YXIgcm93cyA9IHBpeGVscy5sZW5ndGggLyB3aWR0aDtcblx0XHR2YXIgY3BSb3cgPSBmdW5jdGlvbih0b1JvdywgZnJvbVJvdykge1xuXHRcdFx0dmFyIGZyb21QaXhlbHMgPSBwaXhlbHMuc2xpY2UoZnJvbVJvdyAqIHdpZHRoLCAoZnJvbVJvdyArIDEpICogd2lkdGgpO1xuXHRcdFx0bmV3UGl4ZWxzLnNwbGljZS5hcHBseShuZXdQaXhlbHMsIFt0b1JvdyAqIHdpZHRoLCB3aWR0aF0uY29uY2F0KGZyb21QaXhlbHMpKTtcblx0XHR9O1xuXG5cdFx0Ly8gU2VlIGFwcGVuZGl4IEUuXG5cdFx0dmFyIG9mZnNldHMgPSBbMCw0LDIsMV07XG5cdFx0dmFyIHN0ZXBzICAgPSBbOCw4LDQsMl07XG5cblx0XHR2YXIgZnJvbVJvdyA9IDA7XG5cdFx0Zm9yICh2YXIgcGFzcyA9IDA7IHBhc3MgPCA0OyBwYXNzKyspIHtcblx0XHRcdGZvciAodmFyIHRvUm93ID0gb2Zmc2V0c1twYXNzXTsgdG9Sb3cgPCByb3dzOyB0b1JvdyArPSBzdGVwc1twYXNzXSkge1xuXHRcdFx0XHRjcFJvdyh0b1JvdywgZnJvbVJvdyk7XG5cdFx0XHRcdGZyb21Sb3crKztcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gbmV3UGl4ZWxzO1xuXHR9XG5cblx0Ly8gY3JlYXRlIGEgY2xhbXBlZCBieXRlIGFycmF5IHBhdGNoIGZvciB0aGUgZnJhbWUgaW1hZ2UgdG8gYmUgdXNlZCBkaXJlY3RseSB3aXRoIGEgY2FudmFzXG5cdC8vIFRPRE86IGNvdWxkIHBvdGVudGlhbGx5IHNxdWVlemUgc29tZSBwZXJmb3JtYW5jZSBieSBkb2luZyBhIGRpcmVjdCAzMmJpdCB3cml0ZSBwZXIgaXRlcmF0aW9uXG5cdGZ1bmN0aW9uIGdlbmVyYXRlUGF0Y2goaW1hZ2Upe1xuXG5cdFx0dmFyIHRvdGFsUGl4ZWxzID0gaW1hZ2UucGl4ZWxzLmxlbmd0aDtcblx0XHR2YXIgcGF0Y2hEYXRhID0gbmV3IFVpbnQ4Q2xhbXBlZEFycmF5KHRvdGFsUGl4ZWxzICogNCk7XG5cdFx0Zm9yKHZhciBpPTA7IGk8dG90YWxQaXhlbHM7IGkrKyl7XG5cdFx0XHR2YXIgcG9zID0gaSAqIDQ7XG5cdFx0XHR2YXIgY29sb3JJbmRleCA9IGltYWdlLnBpeGVsc1tpXTtcblx0XHRcdHZhciBjb2xvciA9IGltYWdlLmNvbG9yVGFibGVbY29sb3JJbmRleF07XG5cdFx0XHRwYXRjaERhdGFbcG9zXSA9IGNvbG9yWzBdO1xuXHRcdFx0cGF0Y2hEYXRhW3BvcyArIDFdID0gY29sb3JbMV07XG5cdFx0XHRwYXRjaERhdGFbcG9zICsgMl0gPSBjb2xvclsyXTtcblx0XHRcdHBhdGNoRGF0YVtwb3MgKyAzXSA9IGNvbG9ySW5kZXggIT09IGltYWdlLnRyYW5zcGFyZW50SW5kZXggPyAyNTUgOiAwO1xuXHRcdH1cblxuXHRcdHJldHVybiBwYXRjaERhdGE7XG5cdH1cbn07XG5cbi8vIHJldHVybnMgYWxsIGZyYW1lcyBkZWNvbXByZXNzZWRcbkdJRi5wcm90b3R5cGUuZGVjb21wcmVzc0ZyYW1lcyA9IGZ1bmN0aW9uKGJ1aWxkUGF0Y2gpe1xuXHR2YXIgZnJhbWVzID0gW107XG5cdGZvcih2YXIgaT0wOyBpPHRoaXMucmF3LmZyYW1lcy5sZW5ndGg7IGkrKyl7XG5cdFx0dmFyIGZyYW1lID0gdGhpcy5yYXcuZnJhbWVzW2ldO1xuXHRcdGlmKGZyYW1lLmltYWdlKXtcblx0XHRcdGZyYW1lcy5wdXNoKHRoaXMuZGVjb21wcmVzc0ZyYW1lKGksIGJ1aWxkUGF0Y2gpKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGZyYW1lcztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gR0lGOyIsIlxuLy8gU2NoZW1hIGZvciB0aGUganMgZmlsZSBwYXJzZXIgdG8gdXNlIHRvIHBhcnNlIGdpZiBmaWxlc1xuLy8gRm9yIGpzIG9iamVjdCBjb252ZW5pZW5jZSAocmUtdXNlKSwgdGhlIHNjaGVtYSBvYmplY3RzIGFyZSBhcHByb3hpbWF0ZWx5IHJldmVyc2Ugb3JkZXJlZFxuXG4vLyBjb21tb24gcGFyc2VycyBhdmFpbGFibGVcbnZhciBQYXJzZXJzID0gcmVxdWlyZSgnLi4vYm93ZXJfY29tcG9uZW50cy9qcy1iaW5hcnktc2NoZW1hLXBhcnNlci9zcmMvcGFyc2VycycpO1xuXG4vLyBhIHNldCBvZiAweDAwIHRlcm1pbmF0ZWQgc3ViYmxvY2tzXG52YXIgc3ViQmxvY2tzID0ge1xuXHRsYWJlbDogJ2Jsb2NrcycsXG5cdHBhcnNlcjogZnVuY3Rpb24oc3RyZWFtKXtcblx0XHR2YXIgb3V0ID0gW107XG5cdFx0dmFyIHRlcm1pbmF0b3IgPSAweDAwO1x0XHRcblx0XHRmb3IodmFyIHNpemU9c3RyZWFtLnJlYWRCeXRlKCk7IHNpemUhPT10ZXJtaW5hdG9yOyBzaXplPXN0cmVhbS5yZWFkQnl0ZSgpKXtcblx0XHRcdG91dCA9IG91dC5jb25jYXQoc3RyZWFtLnJlYWRCeXRlcyhzaXplKSk7XG5cdFx0fVxuXHRcdHJldHVybiBvdXQ7XG5cdH1cbn07XG5cbi8vIGdsb2JhbCBjb250cm9sIGV4dGVuc2lvblxudmFyIGdjZSA9IHtcblx0bGFiZWw6ICdnY2UnLFxuXHRyZXF1aXJlczogZnVuY3Rpb24oc3RyZWFtKXtcblx0XHQvLyBqdXN0IHBlZWsgYXQgdGhlIHRvcCB0d28gYnl0ZXMsIGFuZCBpZiB0cnVlIGRvIHRoaXNcblx0XHR2YXIgY29kZXMgPSBzdHJlYW0ucGVla0J5dGVzKDIpO1xuXHRcdHJldHVybiBjb2Rlc1swXSA9PT0gMHgyMSAmJiBjb2Rlc1sxXSA9PT0gMHhGOTtcblx0fSxcblx0cGFydHM6IFtcblx0XHR7IGxhYmVsOiAnY29kZXMnLCBwYXJzZXI6IFBhcnNlcnMucmVhZEJ5dGVzKDIpLCBza2lwOiB0cnVlIH0sXG5cdFx0eyBsYWJlbDogJ2J5dGVTaXplJywgcGFyc2VyOiBQYXJzZXJzLnJlYWRCeXRlKCkgfSxcblx0XHR7IGxhYmVsOiAnZXh0cmFzJywgYml0czoge1xuXHRcdFx0ZnV0dXJlOiB7IGluZGV4OiAwLCBsZW5ndGg6IDMgfSxcblx0XHRcdGRpc3Bvc2FsOiB7IGluZGV4OiAzLCBsZW5ndGg6IDMgfSxcblx0XHRcdHVzZXJJbnB1dDogeyBpbmRleDogNiB9LFxuXHRcdFx0dHJhbnNwYXJlbnRDb2xvckdpdmVuOiB7IGluZGV4OiA3IH1cblx0XHR9fSxcblx0XHR7IGxhYmVsOiAnZGVsYXknLCBwYXJzZXI6IFBhcnNlcnMucmVhZFVuc2lnbmVkKHRydWUpIH0sXG5cdFx0eyBsYWJlbDogJ3RyYW5zcGFyZW50Q29sb3JJbmRleCcsIHBhcnNlcjogUGFyc2Vycy5yZWFkQnl0ZSgpIH0sXG5cdFx0eyBsYWJlbDogJ3Rlcm1pbmF0b3InLCBwYXJzZXI6IFBhcnNlcnMucmVhZEJ5dGUoKSwgc2tpcDogdHJ1ZSB9XG5cdF1cbn07XG5cbi8vIGltYWdlIHBpcGVsaW5lIGJsb2NrXG52YXIgaW1hZ2UgPSB7XG5cdGxhYmVsOiAnaW1hZ2UnLFxuXHRyZXF1aXJlczogZnVuY3Rpb24oc3RyZWFtKXtcblx0XHQvLyBwZWVrIGF0IHRoZSBuZXh0IGJ5dGVcblx0XHR2YXIgY29kZSA9IHN0cmVhbS5wZWVrQnl0ZSgpO1xuXHRcdHJldHVybiBjb2RlID09PSAweDJDO1xuXHR9LFxuXHRwYXJ0czogW1xuXHRcdHsgbGFiZWw6ICdjb2RlJywgcGFyc2VyOiBQYXJzZXJzLnJlYWRCeXRlKCksIHNraXA6IHRydWUgfSxcblx0XHR7XG5cdFx0XHRsYWJlbDogJ2Rlc2NyaXB0b3InLCAvLyBpbWFnZSBkZXNjcmlwdG9yXG5cdFx0XHRwYXJ0czogW1xuXHRcdFx0XHR7IGxhYmVsOiAnbGVmdCcsIHBhcnNlcjogUGFyc2Vycy5yZWFkVW5zaWduZWQodHJ1ZSkgfSxcblx0XHRcdFx0eyBsYWJlbDogJ3RvcCcsIHBhcnNlcjogUGFyc2Vycy5yZWFkVW5zaWduZWQodHJ1ZSkgfSxcblx0XHRcdFx0eyBsYWJlbDogJ3dpZHRoJywgcGFyc2VyOiBQYXJzZXJzLnJlYWRVbnNpZ25lZCh0cnVlKSB9LFxuXHRcdFx0XHR7IGxhYmVsOiAnaGVpZ2h0JywgcGFyc2VyOiBQYXJzZXJzLnJlYWRVbnNpZ25lZCh0cnVlKSB9LFxuXHRcdFx0XHR7IGxhYmVsOiAnbGN0JywgYml0czoge1xuXHRcdFx0XHRcdGV4aXN0czogeyBpbmRleDogMCB9LFxuXHRcdFx0XHRcdGludGVybGFjZWQ6IHsgaW5kZXg6IDEgfSxcblx0XHRcdFx0XHRzb3J0OiB7IGluZGV4OiAyIH0sXG5cdFx0XHRcdFx0ZnV0dXJlOiB7IGluZGV4OiAzLCBsZW5ndGg6IDIgfSxcblx0XHRcdFx0XHRzaXplOiB7IGluZGV4OiA1LCBsZW5ndGg6IDMgfVxuXHRcdFx0XHR9fVxuXHRcdFx0XVxuXHRcdH0se1xuXHRcdFx0bGFiZWw6ICdsY3QnLCAvLyBvcHRpb25hbCBsb2NhbCBjb2xvciB0YWJsZVxuXHRcdFx0cmVxdWlyZXM6IGZ1bmN0aW9uKHN0cmVhbSwgb2JqLCBwYXJlbnQpe1xuXHRcdFx0XHRyZXR1cm4gcGFyZW50LmRlc2NyaXB0b3IubGN0LmV4aXN0cztcblx0XHRcdH0sXG5cdFx0XHRwYXJzZXI6IFBhcnNlcnMucmVhZEFycmF5KDMsIGZ1bmN0aW9uKHN0cmVhbSwgb2JqLCBwYXJlbnQpe1xuXHRcdFx0XHRyZXR1cm4gTWF0aC5wb3coMiwgcGFyZW50LmRlc2NyaXB0b3IubGN0LnNpemUgKyAxKTtcblx0XHRcdH0pXG5cdFx0fSx7XG5cdFx0XHRsYWJlbDogJ2RhdGEnLCAvLyB0aGUgaW1hZ2UgZGF0YSBibG9ja3Ncblx0XHRcdHBhcnRzOiBbXG5cdFx0XHRcdHsgbGFiZWw6ICdtaW5Db2RlU2l6ZScsIHBhcnNlcjogUGFyc2Vycy5yZWFkQnl0ZSgpIH0sXG5cdFx0XHRcdHN1YkJsb2Nrc1xuXHRcdFx0XVxuXHRcdH1cblx0XVxufTtcblxuLy8gcGxhaW4gdGV4dCBibG9ja1xudmFyIHRleHQgPSB7XG5cdGxhYmVsOiAndGV4dCcsXG5cdHJlcXVpcmVzOiBmdW5jdGlvbihzdHJlYW0pe1xuXHRcdC8vIGp1c3QgcGVlayBhdCB0aGUgdG9wIHR3byBieXRlcywgYW5kIGlmIHRydWUgZG8gdGhpc1xuXHRcdHZhciBjb2RlcyA9IHN0cmVhbS5wZWVrQnl0ZXMoMik7XG5cdFx0cmV0dXJuIGNvZGVzWzBdID09PSAweDIxICYmIGNvZGVzWzFdID09PSAweDAxO1xuXHR9LFxuXHRwYXJ0czogW1xuXHRcdHsgbGFiZWw6ICdjb2RlcycsIHBhcnNlcjogUGFyc2Vycy5yZWFkQnl0ZXMoMiksIHNraXA6IHRydWUgfSxcblx0XHR7IGxhYmVsOiAnYmxvY2tTaXplJywgcGFyc2VyOiBQYXJzZXJzLnJlYWRCeXRlKCkgfSxcblx0XHR7IFxuXHRcdFx0bGFiZWw6ICdwcmVEYXRhJywgXG5cdFx0XHRwYXJzZXI6IGZ1bmN0aW9uKHN0cmVhbSwgb2JqLCBwYXJlbnQpe1xuXHRcdFx0XHRyZXR1cm4gc3RyZWFtLnJlYWRCeXRlcyhwYXJlbnQudGV4dC5ibG9ja1NpemUpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0c3ViQmxvY2tzXG5cdF1cbn07XG5cbi8vIGFwcGxpY2F0aW9uIGJsb2NrXG52YXIgYXBwbGljYXRpb24gPSB7XG5cdGxhYmVsOiAnYXBwbGljYXRpb24nLFxuXHRyZXF1aXJlczogZnVuY3Rpb24oc3RyZWFtLCBvYmosIHBhcmVudCl7XG5cdFx0Ly8gbWFrZSBzdXJlIHRoaXMgZnJhbWUgZG9lc24ndCBhbHJlYWR5IGhhdmUgYSBnY2UsIHRleHQsIGNvbW1lbnQsIG9yIGltYWdlXG5cdFx0Ly8gYXMgdGhhdCBtZWFucyB0aGlzIGJsb2NrIHNob3VsZCBiZSBhdHRhY2hlZCB0byB0aGUgbmV4dCBmcmFtZVxuXHRcdC8vaWYocGFyZW50LmdjZSB8fCBwYXJlbnQudGV4dCB8fCBwYXJlbnQuaW1hZ2UgfHwgcGFyZW50LmNvbW1lbnQpeyByZXR1cm4gZmFsc2U7IH1cblxuXHRcdC8vIHBlZWsgYXQgdGhlIHRvcCB0d28gYnl0ZXNcblx0XHR2YXIgY29kZXMgPSBzdHJlYW0ucGVla0J5dGVzKDIpO1xuXHRcdHJldHVybiBjb2Rlc1swXSA9PT0gMHgyMSAmJiBjb2Rlc1sxXSA9PT0gMHhGRjtcblx0fSxcblx0cGFydHM6IFtcblx0XHR7IGxhYmVsOiAnY29kZXMnLCBwYXJzZXI6IFBhcnNlcnMucmVhZEJ5dGVzKDIpLCBza2lwOiB0cnVlIH0sXG5cdFx0eyBsYWJlbDogJ2Jsb2NrU2l6ZScsIHBhcnNlcjogUGFyc2Vycy5yZWFkQnl0ZSgpIH0sXG5cdFx0eyBcblx0XHRcdGxhYmVsOiAnaWQnLCBcblx0XHRcdHBhcnNlcjogZnVuY3Rpb24oc3RyZWFtLCBvYmosIHBhcmVudCl7XG5cdFx0XHRcdHJldHVybiBzdHJlYW0ucmVhZFN0cmluZyhwYXJlbnQuYmxvY2tTaXplKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdHN1YkJsb2Nrc1xuXHRdXG59O1xuXG4vLyBjb21tZW50IGJsb2NrXG52YXIgY29tbWVudCA9IHtcblx0bGFiZWw6ICdjb21tZW50Jyxcblx0cmVxdWlyZXM6IGZ1bmN0aW9uKHN0cmVhbSwgb2JqLCBwYXJlbnQpe1xuXHRcdC8vIG1ha2Ugc3VyZSB0aGlzIGZyYW1lIGRvZXNuJ3QgYWxyZWFkeSBoYXZlIGEgZ2NlLCB0ZXh0LCBjb21tZW50LCBvciBpbWFnZVxuXHRcdC8vIGFzIHRoYXQgbWVhbnMgdGhpcyBibG9jayBzaG91bGQgYmUgYXR0YWNoZWQgdG8gdGhlIG5leHQgZnJhbWVcblx0XHQvL2lmKHBhcmVudC5nY2UgfHwgcGFyZW50LnRleHQgfHwgcGFyZW50LmltYWdlIHx8IHBhcmVudC5jb21tZW50KXsgcmV0dXJuIGZhbHNlOyB9XG5cblx0XHQvLyBwZWVrIGF0IHRoZSB0b3AgdHdvIGJ5dGVzXG5cdFx0dmFyIGNvZGVzID0gc3RyZWFtLnBlZWtCeXRlcygyKTtcblx0XHRyZXR1cm4gY29kZXNbMF0gPT09IDB4MjEgJiYgY29kZXNbMV0gPT09IDB4RkU7XG5cdH0sXG5cdHBhcnRzOiBbXG5cdFx0eyBsYWJlbDogJ2NvZGVzJywgcGFyc2VyOiBQYXJzZXJzLnJlYWRCeXRlcygyKSwgc2tpcDogdHJ1ZSB9LFxuXHRcdHN1YkJsb2Nrc1xuXHRdXG59O1xuXG4vLyBmcmFtZXMgb2YgZXh0IGFuZCBpbWFnZSBkYXRhXG52YXIgZnJhbWVzID0ge1xuXHRsYWJlbDogJ2ZyYW1lcycsXG5cdHBhcnRzOiBbXG5cdFx0Z2NlLFxuXHRcdGFwcGxpY2F0aW9uLFxuXHRcdGNvbW1lbnQsXG5cdFx0aW1hZ2UsXG5cdFx0dGV4dFxuXHRdLFxuXHRsb29wOiBmdW5jdGlvbihzdHJlYW0pe1xuXHRcdHZhciBuZXh0Q29kZSA9IHN0cmVhbS5wZWVrQnl0ZSgpO1xuXHRcdC8vIHJhdGhlciB0aGFuIGNoZWNrIGZvciBhIHRlcm1pbmF0b3IsIHdlIHNob3VsZCBjaGVjayBmb3IgdGhlIGV4aXN0ZW5jZVxuXHRcdC8vIG9mIGFuIGV4dCBvciBpbWFnZSBibG9jayB0byBhdm9pZCBpbmZpbml0ZSBsb29wc1xuXHRcdC8vdmFyIHRlcm1pbmF0b3IgPSAweDNCO1xuXHRcdC8vcmV0dXJuIG5leHRDb2RlICE9PSB0ZXJtaW5hdG9yO1xuXHRcdHJldHVybiBuZXh0Q29kZSA9PT0gMHgyMSB8fCBuZXh0Q29kZSA9PT0gMHgyQztcblx0fVxufTtcblxuLy8gbWFpbiBHSUYgc2NoZW1hXG52YXIgc2NoZW1hR0lGID0gW1xuXHR7XG5cdFx0bGFiZWw6ICdoZWFkZXInLCAvLyBnaWYgaGVhZGVyXG5cdFx0cGFydHM6IFtcblx0XHRcdHsgbGFiZWw6ICdzaWduYXR1cmUnLCBwYXJzZXI6IFBhcnNlcnMucmVhZFN0cmluZygzKSB9LFxuXHRcdFx0eyBsYWJlbDogJ3ZlcnNpb24nLCBwYXJzZXI6IFBhcnNlcnMucmVhZFN0cmluZygzKSB9XG5cdFx0XVxuXHR9LHtcblx0XHRsYWJlbDogJ2xzZCcsIC8vIGxvY2FsIHNjcmVlbiBkZXNjcmlwdG9yXG5cdFx0cGFydHM6IFtcblx0XHRcdHsgbGFiZWw6ICd3aWR0aCcsIHBhcnNlcjogUGFyc2Vycy5yZWFkVW5zaWduZWQodHJ1ZSkgfSxcblx0XHRcdHsgbGFiZWw6ICdoZWlnaHQnLCBwYXJzZXI6IFBhcnNlcnMucmVhZFVuc2lnbmVkKHRydWUpIH0sXG5cdFx0XHR7IGxhYmVsOiAnZ2N0JywgYml0czoge1xuXHRcdFx0XHRleGlzdHM6IHsgaW5kZXg6IDAgfSxcblx0XHRcdFx0cmVzb2x1dGlvbjogeyBpbmRleDogMSwgbGVuZ3RoOiAzIH0sXG5cdFx0XHRcdHNvcnQ6IHsgaW5kZXg6IDQgfSxcblx0XHRcdFx0c2l6ZTogeyBpbmRleDogNSwgbGVuZ3RoOiAzIH1cblx0XHRcdH19LFxuXHRcdFx0eyBsYWJlbDogJ2JhY2tncm91bmRDb2xvckluZGV4JywgcGFyc2VyOiBQYXJzZXJzLnJlYWRCeXRlKCkgfSxcblx0XHRcdHsgbGFiZWw6ICdwaXhlbEFzcGVjdFJhdGlvJywgcGFyc2VyOiBQYXJzZXJzLnJlYWRCeXRlKCkgfVxuXHRcdF1cblx0fSx7XG5cdFx0bGFiZWw6ICdnY3QnLCAvLyBnbG9iYWwgY29sb3IgdGFibGVcblx0XHRyZXF1aXJlczogZnVuY3Rpb24oc3RyZWFtLCBvYmope1xuXHRcdFx0cmV0dXJuIG9iai5sc2QuZ2N0LmV4aXN0cztcblx0XHR9LFxuXHRcdHBhcnNlcjogUGFyc2Vycy5yZWFkQXJyYXkoMywgZnVuY3Rpb24oc3RyZWFtLCBvYmope1xuXHRcdFx0cmV0dXJuIE1hdGgucG93KDIsIG9iai5sc2QuZ2N0LnNpemUgKyAxKTtcblx0XHR9KVxuXHR9LFxuXHRmcmFtZXMgLy8gY29udGVudCBmcmFtZXNcbl07XG5cbm1vZHVsZS5leHBvcnRzID0gc2NoZW1hR0lGOyJdfQ==
