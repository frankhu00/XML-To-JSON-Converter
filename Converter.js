/* Converter.js
* Author : Frank Hu
* Date : 7-02-2017
*
* ES6
* Converts XML to JSON.
*
* This does NOT retain the tags that have information stored in tags.
* e.g:
* Original XML :
* <xml>
*   <tag id="123123">
*       A random block of text
*   </tag>
*   <record>
*       <item>Item 1</item>
*   </record>
* </xml>
*
* JSON result will be :
*   { "xml" : { "record" : { "item" : "Item 1"} } }
*
* <tag id="123123"> A random block of text </tag> will be lost after conversion
*
*/

export default class Converter {

  constructor(xmlstring) {
    this.rawJson, this.json, this.jsonString;
    this.regex = /(?:<{1}(.+)>{1})(.+?)(?:(?:<\/){1}(?:\1)>{1})/i
    this.newlineRegex = /\r?\n|\r/g
  }

  convertToJson(xmlstring) {
    this.rawXml = xmlstring.replace(this.newlineRegex, '')
    this.parseXml(this.rawXml)
    return this.getJson()
  }

  parseXml(individual, father = false) {
    let result = {
      parent: '',
      child: '',
      rawValue: '',
      siblings: [],
      associate: {}
    }
    let familyList = individual.match(this.regex);
    let parent, children;

    // Not innermost level
    parent = familyList[1];
    children = familyList[2];
    result.parent = parent;
    result.rawValue = children;

    // Check if it is child (raw value) or another parent of some familyList
    let moreFamilies = children.match(this.regex)
    if (!moreFamilies) {
      // No siblings, only child
      result.child = children;

      // Means this call is main call
      if(!father) {
        // main call -> so define the rawJson and end function
        this.rawJson = result;
        return;
      } else {
        // return result and continue parsing
        return result;
      }
    }

    // Check for more families inside children family
    let childFamilyResult = this.parseXml(moreFamilies[0], moreFamilies[1]);
    result.associate = childFamilyResult;

    // contains one or more families
    // need to look for sibling families
    children = children.replace(moreFamilies[0],'');
    let siblingFamilyList = children.match(this.regex);
    let siblingResults = [];
    while (siblingFamilyList) {
      siblingResults.push(this.parseXml(siblingFamilyList[0], siblingFamilyList[1]));
      children = children.replace(siblingFamilyList[0],"");
      siblingFamilyList = children.match(this.regex);
    }

    if (siblingResults.length > 0) {
      result.siblings = siblingResults;
    }

    // return the results
    if (father) {
      return result;
    }

    // If you reach here, it means you have parsed all
    // Only when father parameter is null (means its the main call)
    // Parse the collected info
    this.rawJson = result;
  }

  getJson() {
    this.json = this.processResult(this.rawJson);
    return this.json;
  }

  getJsonString() {
    this.jsonString = JSON.stringify(this.processResult(this.rawJson));
    return this.jsonString;
  }

  processResult(raw) {
    // Make it into a json obj, then JSON.stringify if needed
    let json, childJson;
    let siblingJson = [];

    // If child has a value -> innermost level
    if(raw.child) {
      json = {
        [raw.parent] : raw.child
      }
    }
    // Not innermost level
    else {
      childJson = this.processResult(raw.associate);
      json = {
        [raw.parent] :  childJson
      }
    }

    if (raw.siblings.length > 0) {
      raw.siblings.forEach( sib => {
        siblingJson.push(this.processResult(sib))
      });
      siblingJson.forEach( sibJson => {
        json[raw.parent] = this.combineJson(json[raw.parent], sibJson);
      })
    }
    return json;
  }

  combineJson(json, addon) {
    let addonKey = Object.keys(addon);
    addonKey.forEach( key => {
      // Already has the key
      if (json.hasOwnProperty(key)) {
        if ( Array.isArray(json[key]) ) {
          json[key].push(addon[key])
        } else {
          let tempValue = json[key];
          json[key] = [];
          json[key].push(tempValue);
          json[key].push(addon[key]);
        }
      } else {
        json[key] = addon[key];
      }
    })
    return json;
  }
}
