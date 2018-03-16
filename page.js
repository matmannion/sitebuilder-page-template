jQuery(function($) {
    var resizeIframes = function resizeIframes() {
      $('.video-container:visible').each(function () {
        var $container = $(this);
        var $panel = $container.parent();
        var panelWidth = $panel.width();
        var panelHeight = $panel.height();
  
        var aspectRatio = panelWidth / panelHeight;
        var targetAspectRatio = 1920 / 1080;
  
        var width, height;
        if (aspectRatio > targetAspectRatio) {
          width = panelWidth;
          height = Math.ceil(panelWidth / targetAspectRatio);
        } else {
          height = panelHeight;
          width = Math.ceil(panelHeight * targetAspectRatio);
        }
  
        $container.find('> iframe').attr({
          width: width,
          height: height
        });
      });
    };
  
    $(window).on('resize.id7.homepage', resizeIframes);
    $(window).on('load', resizeIframes);
    resizeIframes();
  
    /**
     * Use Twitter typeahead to provide course search on an input <input>
     *
     * @see https://twitter.github.io/typeahead.js/
     */
    var CourseSearch = (function () {
      function CourseSearch(o) {
        o = o || {};
        var $input = o.input;
        $input.typeahead({
          minLength: o.minLength,
          hint: o.hint
        }, {
          name: o.name,
          source: o.source,
          display: o.display,
          templates: o.templates,
          async: true,
          limit: 1000
        }).on('keydown', function ($e) {
          var keyCode = $e.which || $e.keyCode;
          switch (keyCode) {
            case 38: // up
            case 40: // down
              // Only if no modifier
              if (!($e.altKey || $e.ctrlKey || $e.metaKey || $e.shiftKey)) {
                $e.stopPropagation();
              }
          }
        });
      }
  
      return CourseSearch;
    })();
  
    $.fn.courseSearch = function (o) {
      o = o || {};
  
      function attach(i, element) {
        var $input = $(element);
        var courseSearch = new CourseSearch($.extend({}, $input.data(), o, {
          input: $input
        }));
  
        $input.data('id7.course-search', courseSearch);
      }
  
      return this.each(attach);
    };
  
    $(function () {
      function escapeHtml(unsafe) {
        return unsafe
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
      }
  
      $('.course-finder .form input[type="search"]').each(function (i, el) {
        // ID-89 On xs, set the min length to 3, not 2, and only show 10 results
        var minLength = 3;
        var maxResults = 10;
  
        if (Modernizr.mq('only all and (min-width: 768px)')) {
          minLength = 2;
          maxResults = 20;
        }
  
        $(el).courseSearch({
          name: 'course',
          source: function (query, sync, async) {
            var searchQuery = encodeURIComponent("(title:" + query + ")OR(keywords:" + query + ")OR(title:" + query + "*)OR(keywords:" + query + "*)");
  
            $.getJSON('//warwick.ac.uk/ajax/lvsch/query.json?resultsPerPage=' + maxResults + '&pagenumber=1&q=' + searchQuery + '&fileFormat=text%2Fhtml&urlPrefix=https%3A%2F%2Fwarwick.ac.uk%2Fstudy%2Fundergraduate%2Fcourses-2018&callback=?', function (results) {
              async(results.results);
            });
          },
          display: 'title',
          minLength: minLength,
          hint: false,
          templates: {
            suggestion: function (o) { return '<div><p class="title">' + escapeHtml(o.title) + '</p></div>'; }
          }
        });
  
        var tt = $(el).data('ttTypeahead');
        tt.input.onSync('queryChanged', function (evtName, query) {
          $(el).data('original-query', query);
        });
  
        $(el).on('typeahead:select', function (evt, result) {
          window.location = result.link;
        });
  
        // ID-145
        if ($(el).width() < 300) {
          $(el).attr('placeholder', 'Enter a course name');
        }
      });
    });
  });