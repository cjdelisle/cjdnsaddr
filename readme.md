# Cjdnsaddr

Tool for parsing and serializing lists of addresses which are sent in the inter-router protocol.

Because protocol versions were not originally in cjdns, the inter-router protocol uses two keys
to communicate lists of nodes. These lists are the replies to getPeers, findNode and supernode
getRoute requests.

The two keys are `n` and `np`. `n` is a benc String containing the node's key and the path to the
node, in binary. Each node occupys 40 bytes of space (32 + 8) so the boundries between nodes are
known. `np` is slightly more complicated, it begins with 1 byte which is 1, 2 or 4 (any other
value is invalid). Following that byte is a list of numbers which are represented as 8 bit, 16 bit
or 32 bit values, depending on whether the first number was a 1, a 2 or a 4. All multi-byte
numbers are in big-endian form.

## API

### parseVersionList(Buffer)

Takes a buffer which contains the version list and outputs a list of numbers.

```
> Cjdnsaddr.parseVersionList(new Buffer('011413111313141414', 'hex'))
[ 20, 19, 17, 19, 19, 20, 20, 20 ]
```

### parseNodeList(Buffer)

Takes a buffer as input and outputs a list of objects each containing `path` and `key`,
an incomplete version of the form given by
[Cjdnskeys.parseNodeName()](https://github.com/cjdelisle/cjdnskeys/#conversion-functions).

```
> Cjdnsaddr.parseNodeList(new Buffer('af6410f0978b9c67019e86162504ba1259f52924a6a9018854a459f718131d000000000014428e05', 'hex'))
[ { key: 'h5t01szlc47hq0sm6n5b228rl8qbznj46fb304lb4fqghdd2x000.k',
    path: '0000.0000.1442.8e05' } ]
```

### parseReply({n:Buffer, np:Buffer})

Takes an object containing `n` and `np` and outputs an array of strings in the form version.path.key.k

```
> Cjdnsaddr.parseReply({
...     n: new Buffer('af6410f0978b9c67019e86162504ba1259f52924a6a9018854a459f718131d000000000014428e05', 'hex'),
...     np: new Buffer('0114', 'hex')
... });
[ 'v20.0000.0000.1442.8e05.h5t01szlc47hq0sm6n5b228rl8qbznj46fb304lb4fqghdd2x000.k' ]
```

### serializeVersionList(Array<number>)

Takes a list of numbers and converts it to a version list buffer.

```
> Cjdnsaddr.serializeVersionList([1,2,3,4,5])
<Buffer 01 01 02 03 04 05>
> Cjdnsaddr.serializeVersionList([1,2,3,4,257])
<Buffer 02 00 01 00 02 00 03 00 04 01 01>
> Cjdnsaddr.serializeVersionList([1,2,3,4,100000])
<Buffer 04 00 00 00 01 00 00 00 02 00 00 00 03 00 00 00 04 00 01 86 a0>
```

### serializeNodeList(Array<{key:string,path:string,v:number}>)

Takes a list of objects, each containing `path` and `key` and converts them into a buffer which is suitable for entry `n`.

```
> Cjdnsaddr.serializeNodeList([ { key: 'h5t01szlc47hq0sm6n5b228rl8qbznj46fb304lb4fqghdd2x000.k',
...     path: '0000.0000.1442.8e05' } ])
<Buffer af 64 10 f0 97 8b 9c 67 01 9e 86 16 25 04 ba 12 59 f5 29 24 a6 a9 01 88 54 a4 59 f7 18 13 1d 00 00 00 00 00 14 42 8e 05>
```

### serializeReply(Array<string>)

Takes an array of nodes in the form version.path.key and converts them to an object containing
`n` and `np`.

```
> Cjdnsaddr.serializeReply([
...     'v20.0000.0000.0000.4f45.5xf8zpuu8171h3f6fm12l59jtbxcw0unv6mpdnpt8xthtlftmw10.k',
...     'v19.0000.0000.1191.b5a5.n53dpw46cdgwlwryqpysvlkszb73gh2cp7hrk9gsg5xh8ccjtpq0.k',
...     'v17.0000.0000.02b9.1123.ythc69s80kp6z19hhsnq9lzn4cvclsgurfuuhhlw4rq1pgr7j0x0.k' ]);
{ np: <Buffer 01 14 13 11>,
  n: <Buffer a5 37 f4 ab d6 28 9c f0 46 33 6d 06 21 4b 82 59 f5 c5 81 a6 db cc ca 68 cd a8 e7 97 65 cb 93 07 00 00 00 00 00 00 4f 45 b4 0c 56 39 31 8b 39 2e f9 f5 ... > }
```