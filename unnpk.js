const fs = require('fs')
const zlib = require('zlib')
//if ft module is installed
try {
	require.resolve('file-type')
	fileType = require('file-type')
} catch (e) {
	var fileType = b => null
}

//reverse bytes 
function reverse(input) {
	var b = typeof input == 'string' ? new Buffer(input, 'hex') : input
	var l = b.length
	var br = new Buffer(l)
	for (var i = 0; i < l; ++i) {
		br.writeUInt8(b.readUInt8((l - 1) - i), i)
	}
	return br.toString('hex')
}

//create folder
function md(edir) {
	if (!fs.existsSync(edir)) {
		fs.mkdirSync(edir)
	}
}

//create many folders
function recreatePath(path) {
	let fparts = path.split("/");
	let tdir = npkname
	let ii = 0
	for (let fpart of fparts) {
		ii++
		tdir += '/' + fpart
		if (ii != fparts.length) {
			md(tdir)
		}
	}
}

//cli 
if (process.argv.slice(2).length < 1) {
	console.log('usage: node unnpk.js file.npk')
	console.log('manifest needs to be placed in "manifest" folder with same name as npk and json extension, e.g. manifest/file.json')
	console.log('you can also enable software-extension-detection by adding any another argument after filename, is enabled by default if manifest cannot be found')
	process.exit()
}
var npkname = process.argv[2].slice(0, -4);
var softmime = process.argv[3] ? true : false;
if (fs.existsSync('./manifest/' + npkname + '.json')) {
	var manifest = JSON.parse(fs.readFileSync('./manifest/' + npkname + '.json', 'utf-8'))
}
var npk = fs.readFileSync('./' + npkname + '.npk')
var offset = 0x14
var mapoffset = parseInt('0x' + reverse(npk.slice(offset, offset + 4)))
var allfiles = []
var fstruct = ['index', 'offset', 'size', 'unzipsize', 'chk', 'zipchk', 'iszip']

console.log('filesize: ' + npk.length + ' bytes')
console.log('map_offset: ' + mapoffset)

var filenames = {}
if (manifest) {
	for (let el of manifest) {
		filenames[el.pos] = el.file_name
	}
} else {
	console.log(manifest)
}
//find filemap and parse it
console.log('mapping...')
for (var fileoffset = mapoffset, l = npk.length; fileoffset < l; fileoffset += 28) {
	let file = npk.slice(fileoffset, fileoffset + 28).toString('hex')
	let parts = file.match(/.{8,8}/g).map((e) => {
		return parseInt('0x' + reverse(e))
	})
	let f = {}
	for (let j = 0, le = parts.length; j < le; j++) {
		f[fstruct[j]] = parts[j]
	}
	f.data = new Buffer(npk.slice(f.offset, f.offset + f.size))
	f.filename = filenames[f.offset] || 'unknown_' + f.index
	allfiles.push(f)
}

md(npkname);
//unzip and unpack files
console.log('unpacking...')
for (let el of allfiles) {
	if (el.iszip) {
		el.data = zlib.inflateSync(el.data);
	} else {
		if (el.size != el.unzipsize) {
			console.log('something is wrong with compression in ' + el.filename)
		}
	}
	recreatePath(el.filename)
	if (!manifest || softmime) {
		let ext = (fileType(el.data) || {ext: manifest?'':'dat'})['ext'];
		el.filename += ext == '' ? '' : '.' + ext;
	}
	fs.writeFileSync(npkname + '/' + el.filename, el.data);
	console.log('unpacked: ' + el.filename)
}