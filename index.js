/*@flow*/
'use strict';
const Cjdnskeys = require('cjdnskeys');

/*::
export type Cjdnsaddr_ReplyBin_t = {
    n: Buffer,
    np: Buffer
};
*/

const parseVersionList = module.exports.parseVersionList = (
    buf /*:Buffer*/
) => {
    const numberSize = buf[0];
    const length = (buf.length - 1) / numberSize;
    if (buf.length < 1 || numberSize === 0 || [1,2,4].indexOf(numberSize) < 0 ||
        (length * numberSize) !== (buf.length - 1))
    {
        throw new Error("Invalid version list [" + buf.toString('hex') + ']');
    }

    let idx = 1;
    const list = (new Array(length)/*:Array<number>*/);
    for (let i = 0; i < list.length; i++) {
        let ver;
        if (numberSize === 1) { ver = buf.readUInt8(idx); }
        else if (numberSize === 2) { ver = buf.readUInt16BE(idx); }
        else if (numberSize === 4) { ver = buf.readUInt32BE(idx); }
        else { throw new Error(); }
        idx += numberSize;
        list[i] = ver;
    }
    return list;
};

const parseNodeList = module.exports.parseNodeList = (
    buf /*:Buffer*/
) => {
    var out = [];
    for (let idx = 0; idx < buf.length;) {
        const n = {};
        n.key = Cjdnskeys.keyBytesToString(buf.slice(idx,idx+32));
        idx += 32;
        n.path = buf.slice(idx, idx + 8).toString('hex').replace(
            /[0-9a-f]{4}/g, (c) => (c + '.')).slice(0, -1);
        idx += 8;
        out.push(n);
    }
    return out;
};

const parseReply = module.exports.parseReply = (
    obj /*:Cjdnsaddr_ReplyBin_t*/
) => {
    const vl = parseVersionList(obj.np);
    const nl = parseNodeList(obj.n);
    if (vl.length !== nl.length) {
        throw new Error("vl.length !== nl.length, invalid nodes reply");
    }
    const out = [];
    for (let i = 0; i < vl.length; i++) {
        out.push('v' + vl[i] + '.' + nl[i].path + '.' + nl[i].key);
    }
    return out;
};

const serializeVersionList = module.exports.serializeVersionList = (
    list /*:Array<number>*/
) => {
    let biggest = 0;
    for (let i = 0; i < list.length; i++) {
        if (list[i] > biggest) { biggest = list[i]; }
    }
    let numberSize = 1;
    if (biggest > 256) { numberSize = 2; }
    if (biggest > 65535) { numberSize = 4; }
    const buf = Buffer.alloc(1 + list.length * numberSize);
    buf[0] = numberSize;
    let idx = 1;
    list.forEach((n) => {
        if (numberSize === 1) { buf.writeUInt8(n, idx); }
        else if (numberSize === 2) { buf.writeUInt16BE(n, idx); }
        else if (numberSize === 4) { buf.writeUInt32BE(n, idx); }
        else { throw new Error(); }
        idx += numberSize;
    });
    return buf;
};

const serializeNodeList = module.exports.serializeNodeList = (
    list /*:Array<{key:string,path:string}>*/
) => {
    const out = [];
    let idx = 0;
    list.forEach((n) => {
        out.push(Cjdnskeys.keyStringToBytes(n.key));
        out.push(new Buffer(n.path.replace(/\./g, ''), 'hex'));
    });
    return Buffer.concat(out);
};

const serializeReply = module.exports.serializeReply = (
    list /*:Array<string>*/
) => {
    const parsedList = list.map(Cjdnskeys.parseNodeName);
    const versions = parsedList.map((n) => ((n /*:any*/).v));
    return {
        np: serializeVersionList(versions),
        n: serializeNodeList(parsedList)
    };
};