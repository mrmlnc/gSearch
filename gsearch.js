/*!
 * gSearch
 * --
 * @version: 0.2.2
 * @author: Denis Malinochkin
 * @license: MIT
 * @git: https://github.com/mrmlnc/gSearch
 */

+ function($) {
  'use strict';

  // Plugin initialization
  $.fn.gSearch = function(extOptions) {
    var options = $.extend({
      // Displaying search results (element)
      results: false,
      // The maximum number of results
      resultsMax: false,
      // The address of your RSS feed
      rss: '/rss',
      // Having search results appear on key up
      liveSearch: false,
      // Customizing the html template
      resultTemplate: '<a href="{{link}}"><h2>{{title}}</h2><span>{{creator}} - {{pubDate}}</span></a>',
      infoTemplate: '<p>Number of posts found: {{amount}}</p>',
      // Hiding the search info
      displaySearchInfo: true,
      // Hiding the search info when the result is zero
      zeroResultsInfo: true,
      // Limit on the number of characters in description
      descriptionLength: false,
      // An ellipsis at the end of the description
      descriptionEllipsis: false,
      // Removing HTML tags from text in description
      descriptionTags: true,
      // Additional language for search
      language: false,
      // Callback function before the search operation
      beforeFind: false,
      // Callback function after the search operation, but before display the results
      afterFind: false,
      // Callback function after performing a search and display the results
      onComplete: false
    }, extOptions);

    // If there is objective
    if (options.results) {
      pluginMethods.init(this, options);
      return pluginMethods;
    }
  }

  // Plugin methods
  var pluginMethods = {

    isInit: false,

    init: function(target, options) {
      var that = this;

      // Options
      this.target = target;
      this.results = options.results;
      this.resultsMax = options.resultsMax;
      this.rss = options.rss;
      this.rssData = [];
      this.resultTemplate = options.resultTemplate;
      this.infoTemplate = options.infoTemplate;
      this.zeroResultsInfo = options.zeroResultsInfo;
      this.displaySearchInfo = options.displaySearchInfo;
      this.descriptionLength = options.descriptionLength;
      this.descriptionEllipsis = options.descriptionEllipsis;
      this.descriptionTags = options.descriptionTags;
      this.beforeFind = options.beforeFind;
      this.afterFind = options.afterFind;
      this.onComplete = options.onComplete;

      // Standart lunr index initialization
      this.idx = lunr(function() {
        // If the defined secondary language
        if (options.language) {
          if (typeof lunr.stemmerSupport === 'undefined') {
            throw new Error('Support language extensions requires Stemmer');
          }
          this.use(lunr[options.language]);
        }

        this.field('title', {
          boost: 10
        });
        this.field('creator');
        this.field('description');
        this.field('link');
        this.field('category');
        this.field('pubDate');
        this.ref('id');
      });

      // Load rss feed
      target.closest('form').submit(function(event) {
        event.preventDefault();
        that.loadRSS().then(function() {
          that.find(target.val());
        });
      });

      // Live search
      if (options.liveSearch) {
        target.keyup(function() {
          that.loadRSS().then(function() {
            that.find(target.val());
          });
        });
      }
    },

    loadRSS: function() {
      if (this.isInit) {
        return $.Deferred().resolve();
      }

      // Here we load an rss feed, parse it and load it into the index.
      // This function will not call on load to avoid unnecessary heavy
      // operations on a page if a visitor never endks up searching anything.

      var idx = this.idx;
      var depthSearch = this.resultsMax;
      var rssURL = this.rss;
      var rssData = this.rssData;
      var that = this;

      return $.get(rssURL, function(data) {
        var posts = $(data).find('item');
        var length = posts.length;

        if (depthSearch && depthSearch <= length) {
          length = depthSearch;
        }

        for (var _postIndex = 0; _postIndex < length; _postIndex++) {
          var post = posts.eq(_postIndex);
          var parsedData = {
            id: _postIndex + 1,
            title: post.find('title').text(),
            creator: post.find('creator').text(),
            description: post.find('description').text(),
            category: post.find('category'),
            pubDate: post.find('pubDate').text(),
            link: post.find('link').text()
          }

          // Join category
          var category = [];
          for (var _catIndex = 0; _catIndex < parsedData.category.length; _catIndex++) {
            var categoryText = $(parsedData.category[_catIndex]).text();
            category.push(categoryText);
          }
          parsedData.category = category.join(', ');

          idx.add(parsedData);
          rssData.push(parsedData);
        };
      }).then(function() {
        // Callback function before the search operation
        if (that.beforeFind) {
          that.beforeFind(rssData);
        }

        that.isInit = true;
      });
    },

    find: function(value) {
      var searchResult = this.idx.search(value);
      var results = $(this.results);
      var resultsData = [];

      results.empty();

      // Callback function after the search operation, but before display the results
      if (this.afterFind) {
        this.afterFind(searchResult);
      }

      if (this.zeroResultsInfo || searchResult.length > 0) {
        if (this.displaySearchInfo) results.append(this.format(this.infoTemplate, {
          "amount": searchResult.length
        }));
      }

      for (var _resultIndex = 0; _resultIndex < searchResult.length; _resultIndex++) {
        var postData = this.rssData[searchResult[_resultIndex].ref - 1];

        // Removing HTML tags from text in description
        if (!this.descriptionTags || typeof this.descriptionTags === 'string') {
          postData.description = stripTags(postData.description, this.descriptionTags);
        };

        // Limit on the number of characters in description
        if (this.descriptionLength) {
          postData.description = postData.description.slice(0, this.descriptionLength).trim();
        };

        // An ellipsis at the end of the description
        if ((!this.descriptionTags || typeof this.descriptionTags === 'string') && this.descriptionEllipsis) {
          postData.description += this.descriptionEllipsis;
        };

        results.append(this.format(this.resultTemplate, postData));
        resultsData.push(postData);
      }

      // Callback function after performing a search and display the results
      if (this.onComplete) {
        this.onComplete(resultsData);
      }
    },

    clear: function() {
      $(this.results).empty();
      this.target.val('');
    },

    format: function(t, d) {
      return t.replace(/{{([^{}]*)}}/g, function(a, b) {
        var r = d[b];
        return typeof r === 'string' || typeof r === 'number' ? r : a;
      });
    }

  };

  // Strip all HTML tags, except allowed
  var stripTags = function(input, allowed) {
    allowed = (((allowed || '') + '')
      .toLowerCase()
      .match(/<[a-z][a-z0-9]*>/g) || [])
      .join('');
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
      commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
    return input.replace(commentsAndPhpTags, '')
      .replace(tags, function($0, $1) {
        return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
      });
  };

}(jQuery, lunr);
