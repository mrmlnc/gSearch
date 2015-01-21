gSearch
==============

A simple and flexible search based on RSS for Ghost and more.

Basic idea — [ghostHunter](https://github.com/i11ume/ghostHunter).

Support
--------------

RSS feed with fields:
 
 * Title
 * Creator
 * Description
 * Link
 * Category
 * pubDate
 * Id

Requires
--------------

 * [jQuery](https://github.com/jquery/jquery)
 * [Lunr.js](https://github.com/olivernn/lunr.js)

Installation
--------------

* Download the files you need from the this repository;
* Bower: `$ bower i gsearch --save`;
* Git: `$ git clone git://github.com/mrmlnc/gSearch.git`;

How to use
--------------

**Step 1**

Add the following code inside your HTML:

````HTML
<script src="path/to/../jquery.min.js"></script>
<script src="path/to/../lunr.min.js"></script>
<script src="path/to/../gsearch.min.js"></script>
````

If you need [additional language](https://github.com/MihaiValentin/lunr-languages) to search, add before `gsearch.js`:

````HTML
<script src="path/to/../lunr.stemmer.support.js"></script>
<script src="path/to/../lunr.ru.js"></script>
````

**Step 2**

Initialize the plugin:

````JS
$('#searchInput').gSearch({
  results: '#searchResult'
});
````

Advanced features
--------------

**results** *[false (default) || string]*

Element to display the search results.

````JS
{
  results: '#resultBox'
}
````

---

**resultsMax** *[false (default) || number]*

The number of search results to display.

````JS
{
  resultsMax: 10
}
````

---

**rss** *['/rss' (default) || string]*

If the rss feed on your website is different than a standard ghost installation \rss you can specify that in the options.

````JS
{
  rss: 'rss.xml'
}
````

---

**liveSearch** *[true || false (default)]*

You can have the search results appear "as you type".

````JS
{
  liveSearch: true
}
````

---

**resultTemplate** *[string]*

Customizing the html template to display the results.

The result template has access to these variables: 
 
 * title
 * creator
 * description
 * link
 * category
 * pubDate

````JS
{
  resultTemplate: '<h4>{{title}}</h4><p>{{description}}</p>'
}
````

---

**infoTemplate** *[string]*

Customizing the html template to display information on the results of the search.

The info template has access to these variables:

 * amount

````JS
{
  infotemplate: '<p>Number of posts found: {{amount}}</p>'
}
````

---

**displaySearchInfo** *[true || false (default)]*

If you don't want to show the search info.

````JS
{
  displaySearchInfo: false
}
````

---

**zeroResultsInfo** *[true (default) || false]*

If you don't want to show the search info when the results are zero.

````JS
{
  zeroResultsInfo: true
}
````

---

**descriptionLength** *[false (default) || number]*

Limit on the number of characters in description.

````JS
{
  descriptionLength: 200
}
````

---

**descriptionEllipsis** *[false (default) || string]*

An ellipsis at the end of the description.

````JS
{
  descriptionEllipsis: '>>>'
}
````

---

**descriptionTags** *[true (default) || false || string]*

Removing all HTML tags from text in description or strip all HTML tags, except allowed.

````JS
{
  descriptionTags: true,
  descriptionTags: '<h1><p>'
}
````

---

**language** *[false (default) || string]*

If you need additional language for your search, please specify it.

````JS
{
  language: 'ru'
}
````

Additional dependencies:

````HTML
<script src="path/to/../lunr.stemmer.support.js"></script>
<script src="path/to/../lunr.ru.js"></script>
````

---

**beforeFind** *[false (default) || function]*

Callback function before the search operation.

Access to variables:

 * rssData (parsed RSS feed)

````JS
beforeFind: function(data) {
  console.log(data)
}
````

---

**afterFind** *[false (default) || function]*

Callback function after the search operation, but before display the results.

Access to variables:

 * searchResult (search results)

````JS
afterFind: function(data) {
  console.log(data)
}
````

---

**onComplete** *[false (default) || function]*

Callback function after performing a search and display the results.

Access to variables:

 * resultsData (search results)

````JS
afterFind: function(data) {
  console.log(data)
}
````

---

Clearing the results
--------------

You can use gSearch to clear the results of your query. gSearch will return an object relating to your search field and you can use that object to clear results.

Example:

````JS
var searchInput = $('#searchInput').gSearch({
  results: '#searchResult'
});

// Bootstrap Dropdown hide event (as an example)
$('#searchDropdown').on('hide.bs.dropdown', function() {
  searchInput.clear();
});
````

License
--------------

[MIT](LICENSE).
