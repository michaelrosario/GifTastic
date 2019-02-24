    // Load topics from localStorage if available
    var topics = window.localStorage.getItem("animals");
    if(!topics){
      topics = [
        "dogs",
        "cats",
        "mouse"
      ];
    } else {
      topics = topics.split(",");
    }
    
    // Run function to add and update localStorage with buttons
    generateButtons(topics); 

    // Load favorites from localStorage if available
    var favorites = window.localStorage.getItem("favoriteItems");
    $(document).ready(function(){
      if(favorites){
        var content = $(favorites);
        var container = $("#gifs-appear-here");
        container.masonry("destroy").append(content)
        .imagesLoaded(function () {
          container.masonry({itemSelector: '.gifImage'}); 
        });
      }
    });

    // Download ckicked image
    $(document).on("click",".download",function(e){
      e.preventDefault();
      downloadResource($(this).attr("href"),$(this).attr("download"));
    });
   
    var offset = 0; // global offset variable

    // Button clicks for offset and buttons
    $(document).on("click","button", function() {
      if($(this).hasClass("offset")){
        // Load with offset
        offset=offset+10;
        console.log(offset);
        $("#gifs-appear-here").masonry();
      } else {
        // Load from scratch
        offset = 0;
        $("#gifs-appear-here .gifImage:not(.favorite)").remove();
        $("#gifs-appear-here").masonry('destroy');
      }

      // get data from buttons and create elements
      var animal = $(this).attr("data-animal");
      var elements = $("<div>");

      // for additional giphy images
      $("#loadAdditional button").find("span").text(animal);
      $("#loadAdditional button").attr('data-animal',animal);
      $("#loadAdditional").fadeIn();
      
      // API Variables & Query
      var apiKey = 'THXk3SHSIk0wxK9Q64Ut747j8qq0p9ZD';
      var queryURL = `https://api.giphy.com/v1/gifs/search?q=${animal}&api_key=${apiKey}&limit=10&offset=${offset}`;

      // Query Giphy API
      $.ajax({
        url: queryURL,
        method: "GET"
      }).then(function(response) {
      
        console.log(response);
        var results = response.data;
        
        for (var i = 0; i < results.length; i++) {

          var container =  $("#gifs-appear-here");  

            if($("#"+results[i].id).length){

              // check for duplicate items from favorited items

            } else {

            // create the elements
            var animalDiv = $("<div>");
            var animalImage = $("<img>");
            var animalRating = $("<p>");
            var download = $("<a>");
            var favorite = $("<a>");

            favorite.addClass("favorite")
              .html("<i class='far fa-star'></i>")
              .attr("title","Make this your favorite.");

            download.addClass("download")
              .attr('href',results[i].images.fixed_height.url)
              .attr("download","giphy.gif")
              .attr("title","Download this image.")
              .html("<i class='fa fa-download'></i>");

            animalRating
              .addClass("rating")
              .attr("title","This image is rated "+results[i].rating)
              .html(`<span>Rated&nbsp;</span>${results[i].rating}`);
            animalImage
              .attr("src",results[i].images.fixed_height_still.url)
              .attr("data-animated",results[i].images.fixed_height.url);
            animalDiv
              .addClass("gifImage")
              .attr("id",results[i].id)
              .prepend(animalImage)
              .append(animalRating)
              .append(favorite)
              .append(download);
            
            // if we are appending or starting from empty
            if(offset > 0){               
              container.append(animalDiv).masonry( 'appended', animalDiv, true ).masonry();   
            } else {
              container.prepend(animalDiv);
            }

          }
          // When we are on the last item of the loop
          if(i === results.length-1){
            container.imagesLoaded(function () {
              container.masonry({
                itemSelector: '.gifImage',
                animate: true                
              });
            });
          }
        }

      });
    });

    // When a favorite is clicked, we save/remove to localStorage
    $(document).on("click","a.favorite", function() {

      if($(this).parent().hasClass("favorite")){
        $(this).find("i").attr("class","far fa-star");
        $(this).parent().removeClass("favorite");
      } else {
        $(this).find("i").attr("class","fas fa-star");
        $(this).parent().addClass("favorite");
      }
      var elements = "";
      if( $(".gifImage.favorite").length){
        $(".gifImage.favorite").each(function(){
          elements += `<div id="${$(this).attr('id')}" class="${$(this).attr('class')}">${$(this).html()}</div>`;
          window.localStorage.setItem("favoriteItems",elements);
        });
      } else {
        window.localStorage.removeItem("favoriteItems");
      }

    });

    // clicking on images, we switch from static to play and vice-versa
    $(document).on("click","img", function() {
      
      // variables to perform the switch
      var animatedImg = $(this).attr("data-animated");
      var previousImg = $(this).attr("src"); //switch
      $(this).attr("data-animated",previousImg);

      var checkAnimated = animatedImg;

      // switch images from static to play
      if($(this).parent().hasClass("animated")){
        $(this).parent().removeClass("animated");
        $(this).attr("src",animatedImg);
        checkAnimated = previousImg;
      } else {
        $(this).parent().addClass("animated");
        $(this).attr("src",animatedImg);
        checkAnimated = animatedImg;
      }

      // switch off all gifs except selected one
      $(".gifImage.animated").each(function(){
        var staticImage = $(this).find("img").attr("data-animated");
        var animatedImage = $(this).find("img").attr("src"); //switch
        if(checkAnimated != animatedImage){
          $(this).find("img").attr("data-animated",animatedImage);
          $(this).find("img").attr("src",staticImage);
          $(this).removeClass("animated");
        }
      });
      
      // use masonry plugin to organize different sized images
      var container =  $("#gifs-appear-here");
      container.imagesLoaded(function () {
        container.masonry({
          itemSelector: '.gifImage'
        });
      });
    });

    // Add additional buttons
    $("form").on("submit",function(e){
      e.preventDefault();
      var value = $("form input").val().trim();
      $("form input").val("");
      if(value && topics.indexOf(value) === -1){
        topics.push(value);
        generateButtons(topics);
      }
    });

    // Trigger form submit
    $(document).on("click",".submit", function() {
      $("form").submit();
    });

    // Remove buttons and update localStorage
    $(document).on("click",".fa-trash", function(e) {
      e.preventDefault();
      $(this).parent().remove();
      var index = topics.indexOf($(this).parent().attr("data-animal"));
      topics.splice(index, 1);
      localStorage.setItem('animals', topics);
      return false;
    });

     // function to load the buttons
     function generateButtons(arr){
      localStorage.setItem('animals', arr);
      $("#button-lists").empty();
      for(var i = 0; i < arr.length; i++){
        var btn = $("<button>");
        btn.attr("data-animal",arr[i]);
        btn.html(arr[i]+"<i class='fa fa-trash'></i>");
        $("#button-lists").append(btn);
      }
    }


    // function to allow download from Cross Domain
    function forceDownload(blob, filename) {
      var a = document.createElement('a');
      a.download = filename;
      a.href = blob;
      // For Firefox https://stackoverflow.com/a/32226068
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
    
    // Current blob size limit is around 500MB for browsers
    function downloadResource(url, filename) {
      if (!filename) filename = url.split('\\').pop().split('/').pop();
      fetch(url, {
          headers: new Headers({
            'Origin': location.origin
          }),
          mode: 'cors'
        })
        .then(response => response.blob())
        .then(blob => {
          let blobUrl = window.URL.createObjectURL(blob);
          forceDownload(blobUrl, filename);
        })
        .catch(e => console.error(e));
    }
    
    
