/*@flow*/
'use strict';

const Cjdnsaddr = require('./index.js');

const TEST_VAL = {
    n: new Buffer('af6410f0978b9c67019e86162504ba1259f52924a6a9018854a459f718131d000000000014428e05', 'hex'),
    np: new Buffer('0114', 'hex')
};

const RES = '[{"key":"h5t01szlc47hq0sm6n5b228rl8qbznj46fb304lb4fqghdd2x000.k","path":"0000.0000.1442.8e05"}]';

if (JSON.stringify(Cjdnsaddr.parseVersionList(TEST_VAL.np)) !== '[20]') { throw new Error(); }
if (JSON.stringify(Cjdnsaddr.parseNodeList(TEST_VAL.n)) !== RES) { throw new Error(); }
if (JSON.stringify(Cjdnsaddr.parseReply(TEST_VAL)) !==
    '["v20.0000.0000.1442.8e05.h5t01szlc47hq0sm6n5b228rl8qbznj46fb304lb4fqghdd2x000.k"]')
{
    throw new Error();
}

const TEST_TWO = {
    n: new Buffer(
        'a537f4abd6289cf046336d06214b8259f5c581a6dbccca68cda8e79765cb93070000000000004f45' +
        'b40c5639318b392ef9f5b67abc65c45f9de19e58f5bc1b93c3aef487d682b95a000000001191b5a5' +
        '3ebf6512462056f3437a0f539be4a764ed25b1d3b769fd9ee4e4da50dd3d10740000000002b91123' +
        '34569b10f941eb8a764d6d00cdf6bea6898d39ca0661bb7f9955965204f33e42000000019062cd05' +
        '49f4984a15b053e89101d820cdd46c955f81e17482a0503b44799b3bcfbf276a000000001131b5a5' +
        '534381be3c5e5f54b834b0ceb478fabdf337214a74017f8d055dc4857df051650000000000282665' +
        'bbf636b4a91a2898d67ea259829260f3cf2548579f14176a8042b36422ab45100000000012d235a5' +
        '3e57b800f874a099f0499fa85bc6b3f900310579fd0b6f3b3c8ed4b303a1426100000000002e2665', 'hex'),
    np: new Buffer('011413111313141414', 'hex')
};

const TEST_TWO_PARSED = [
    'v20.0000.0000.0000.4f45.5xf8zpuu8171h3f6fm12l59jtbxcw0unv6mpdnpt8xthtlftmw10.k',
    'v19.0000.0000.1191.b5a5.n53dpw46cdgwlwryqpysvlkszb73gh2cp7hrk9gsg5xh8ccjtpq0.k',
    'v17.0000.0000.02b9.1123.ythc69s80kp6z19hhsnq9lzn4cvclsgurfuuhhlw4rq1pgr7j0x0.k',
    'v19.0000.0001.9062.cd05.nkpq984z1uup8vp9f30udvvr6f2vsw8t68sqvz5mpl5552dyykj0.k',
    'v19.0000.0000.1131.b5a5.92xk95p2jxnjy860s68udbmfpwr2sjmg2481pxj8tv6rm7zr7ku0.k',
    'v20.0000.0000.0028.2665.muj28zl7yur85wl6jpm9cw9zxxwhmj89nc0yr6q0x2kcsy1ykbt0.k',
    'v20.0000.0000.12d2.35a5.vpxf3u6pu0bj9cvh2fq4892dmzmc24xbz45g1p1j2ud96kdp5240.k',
    'v20.0000.0000.002e.2665.ytpjc00zn38m9s79z4br53hqt702m24hxz2yqxj7g4p7v14n2bs0.k'
];
if (JSON.stringify(Cjdnsaddr.parseReply(TEST_TWO)) !== JSON.stringify(TEST_TWO_PARSED)) {
    throw new Error();
}
const ser = Cjdnsaddr.serializeReply(TEST_TWO_PARSED);
if (ser.n.compare(TEST_TWO.n) || ser.np.compare(TEST_TWO.np)) { throw new Error(); }