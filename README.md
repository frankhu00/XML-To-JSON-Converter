# XML-To-JSON-Converter
Converts XML to JSON. 
See below for limitations

This converter does not handle attributes in tags.
If a tag has any attributes, the whole tag and its contents are discard.

Example :
<xml>
  <tag id="123123">
    A random block of text
  </tag>
  <record>
    <item>Item 1</item>
  </record>
</xml>

JSON result will be :
{ "xml" : { "record" : { "item" : "Item 1"} } }


To get js object from xml, use
```javascript
const xmlConverter = new Converter();

json = xmlConverter.convertToJson(xmlstring);
```
