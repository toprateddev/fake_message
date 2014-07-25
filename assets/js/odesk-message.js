(function(window) {
	'use strict';

	var scrollTimer = null;


	/**
	 * Handler of scroll
	 */
	var scrollHandler = function() {
		scrollTimer = null;
		var headerBottom = 111,
			$leftSideBar = $('div.oFakeMessageLeftSideBar'),
			scrollTop = $(window).scrollTop(),
			leftSideBarMarginTop = 0,
			verticalBound = Math.max($('body').height() - $('header').height() - 10,
									$('div.oFakeMessageContent').height(),
									$('div.oFakeMessageLeftSideBar').height());

		if ( scrollTop > headerBottom )
		{
			leftSideBarMarginTop = scrollTop - headerBottom;
			var curStrMarginTop = $leftSideBar.css('margin-top');
			var curMarginTop = parseInt(curStrMarginTop.substring(0, curStrMarginTop.length - 2));

			if (curMarginTop > leftSideBarMarginTop) {
				$leftSideBar.animate({marginTop:"-=" + (curMarginTop - leftSideBarMarginTop) + "px"});
			}
			else {
				if (leftSideBarMarginTop + $leftSideBar.height() > verticalBound ) {
					leftSideBarMarginTop = verticalBound - $leftSideBar.height();
					$leftSideBar.animate({marginTop:"+=" + (leftSideBarMarginTop - curMarginTop) + "px"});
				} else {
					$leftSideBar.animate({marginTop:"+=" + (leftSideBarMarginTop - curMarginTop) + "px"});
				}
			}
			
		} else {
			$leftSideBar.css('margin-top', '0');
		}
	};


	/**
	 * CSS replacing class
	 * @constructor
	 */
	var oDeskMessage = function(options) {

		this._cssFiles = {
							"from": ["globals.css"],
							"to":   ["assets/css/odesk.css"]
						};
		this._scriptFiles = ["assets/js/jquery-1.10.2.min.js"];
		this._host = "https://www.odesk.com/";
		this._messagesAjaxPath = "api/mc/v2/trays/";
		this._messageBoxFileName = "/inbox.json";
		this._messages = null;
		this._cssFiles = ["assets/css/message-style.css"];
		this._username = this.getUsername();

	};

	/**
	 * Definition of prototype
	 */
	oDeskMessage.prototype = {
		/**
		 * Initializer
		 * To do
		 */
		init: function() {
			this.addFakeMessageNav();
			this._username = this.getUsername();
			this.addStyleInfo(this._cssFiles);
			this.addScripts(this._scriptFiles);
			return this;
		},


		/**
		 * Getting oDesk username from page
		 */
		getUsername: function() {
			return $('div#simpleCompanySelector ul.oDropdownList li.oDropdownFooter.unselectable span.oNavMutedText').text();
		},

		/**
		 * Add fake menu "Test Message" to test
		 */
		addFakeMessageNav: function() {
			var $navContainer = $('nav.oNavInline ul.oNavTablist'),
				$navItem = $('<li/>', {'class': 'jsNavMC', 'id': 'oNavFakeNavItem'}).append($('<a/>', {'class':'oNavTab jsNavMC'}).text('Test Messages'));

			$navContainer.append($navItem);
			$navItem.click(this.fakeMessageHandler);
		},

		/**
		 * Adding extra stylesheet files.
		 */
		addStyleInfo: function(files) {
			var root = document.getElementsByTagName('body')[0],
				head = document.getElementsByTagName("head")[0];

			if( !head){
				head = document.createElement("head"); 
				root.appendChild( head); 
			}
			
			for (var i = 0; i < files.length; i++) {
				var link = document.createElement("link");
			
				link.href = chrome.extension.getURL(files[i]);
				link.type = "text/css";
				link.rel = "stylesheet";
				head.appendChild(link);
			}
		},

		addScripts: function(files) {
			var $root = $('body'),
				$head = $('head');

			if( !$head){
				$head = $('head'); 
				$root.appendChild($head); 
			}
			
			for (var i = 0; i < files.length; i++) {
				var $script = $('<script/>', {'src': chrome.extension.getURL(files[i]), 'type': 'text/javascript'});
				$head.append($script);
			}
		},


		/**
		 * Test menu handler
		 * This occurs when user click the "Test Message" menu item
		 */
		fakeMessageHandler: function(event) {
			event.preventDefault();
			$('nav.oNavInline ul.oNavTablist a.oNavTab.isCurrent').removeClass('isCurrent');
			$('nav.oNavInline ul.oNavTablist li#oNavFakeNavItem a').addClass('isCurrent');

			var address = self._host + self._messagesAjaxPath + self._username + self._messageBoxFileName;

			$.getJSON(address, self.renderSection);
		},

		/**
		 * Render the whole messages section
		 */
		renderSection: function(data) {
			var $messageContainer = $('div#main'),
				threads = data.current_tray.threads,
				$leftSideBar = $('<div/>', {'class': 'oFakeMessageLeftSideBar'}),
				$content = $('<div/>', {'class': 'oFakeMessageContent'}),
				$leftTop = $('<div/>', {'class': 'leftTopBar'}),
				$contentTop = $('<div/>', {'class': 'contentTopBar'}),
				$leftSearchSpan = $('<span/>', {'class': 'oFakeMessageSearch', 'id': 'oFakeLeftSearch'}),
				$leftDropdownSpan = $('<span/>', {'class': 'oFakeDropdown', 'id': 'oFakeLeftDropdown'}),
				$leftDropdownDiv = $('<div/>', {'class': 'leftDropdownDiv'}),
				$leftDropdownUl = $('<ul/>', {'class': 'dropdown'}),
				$leftDropdownUlSpan = $('<span/>', {'class': 'triangle'}).appendTo($leftDropdownUl),
				$dropdownCreateNewWorkRoom = $('<li/>', {'class': 'dropdownItem', 'id': 'createNewWorkRoom'}).text("Create new Work Room").appendTo($leftDropdownUl),
				$dropdownInviteSomeoneToChat = $('<li/>', {'class': 'dropdownItem', 'id': 'inviteSomeoneToChat'}).text("Invite Someone To Chat").appendTo($leftDropdownUl),
				$dropdownSeeAllPublicRooms = $('<li/>', {'class': 'dropdownItem', 'id': 'seeAllPublicRooms'}).text("See All Public Rooms").appendTo($leftDropdownUl),
				$dropdownDivider1 = $('<li/>', {'class': 'dropdownItem dropdownDivider', 'id': 'divider1'}).text("-----").appendTo($leftDropdownUl),
				$dropdownManageFiles = $('<li/>', {'class': 'dropdownItem', 'id': 'manageFiles'}).text("Manage Files").appendTo($leftDropdownUl),
				$dropdownManageContacts = $('<li/>', {'class': 'dropdownItem', 'id': 'manageContacts'}).text("Manage Contacts").appendTo($leftDropdownUl),
				$dropdownManageArchivedRooms = $('<li/>', {'class': 'dropdownItem', 'id': 'manageArchivedRooms'}).text("Manage Archived Rooms").appendTo($leftDropdownUl),
				$dropdownDivider2 = $('<li/>', {'class': 'dropdownItem dropdownDivider', 'id': 'divider2'}).text("-----").appendTo($leftDropdownUl),
				$dropdownMessageNotificationSettings = $('<li/>', {'class': 'dropdownItem', 'id': 'messageNotificationSettings'}).text("Message Notification Settings").appendTo($leftDropdownUl),
				$contentDropdownSpan = $('<span/>', {'class': 'oFakeDropdown',  'id': 'oFakeContentDropdown'}),
				$contentSearchSpan = $('<span/>', {'class': 'oFakeMessageSearch', 'id': 'oFakeContentSearch'});

			$messageContainer.children().hide();
			$leftDropdownSpan.append($leftDropdownDiv.append($leftDropdownUl))
			$leftTop.append($('<h6/>', {'class': 'leftTopTitle', 'id': 'leftTopTitle'}).text("Rooms"), $leftDropdownSpan, $leftSearchSpan);
			$contentTop.append($('<h6/>', {'class': 'contentTopTitle', 'id': 'contentTopTitle'}).text(threads[0].subject), $contentDropdownSpan, $contentSearchSpan);
			$messageContainer.append($leftSideBar.append($leftTop), $content.append($contentTop));

			$(document).click(function(event) {
				// event.preventDefault();

				var $el = $(event.target);
				if ( $el.attr('id') == "oFakeLeftDropdown") {
					$leftDropdownDiv.show();
				} else if( $el.parents('span.oFakeDropdown#oFakeLeftDropdown').length == 0 ) {
					$leftDropdownDiv.hide();
				} else if ( $el.hasClass('dropdownItem') && !($el.hasClass('dropdownDivider'))) {
					alert($el.text());
				}
			});

			self.renderLeftSide($leftSideBar, threads);
		},

		/**
		 * Render left side bar
		 */
		renderLeftSide: function(container, threads) {
			var $favoriteContainer = $('<ul/>', {'id': 'leftSideFavorite', 'class': 'roomCategory'}).append($('<h6/>', {'class': 'categoryTitle'}).text("favorites")),
				$recentContainer = $('<ul/>', {'id': 'leftSideRecent', 'class': 'roomCategory'}).append($('<h6/>', {'class': 'categoryTitle'}).text("recent")),
				$olderContainer = $('<ul/>', {'id': 'leftSideOlder', 'class': 'roomCategory'}).append($('<h6/>', {'class': 'olderTitle hidden-container'}).text("older...")),
				ind = 0;

			for (var i = 0; i < threads.length; i++) {
				var curThread = threads[i],
					$li = $('<li/>', {'class': 'item'}),
					$titleContainer = $('<div/>', {'class': 'titleContainer'}),
					$timeContainer = $('<div/>', {'class': 'timeContainer'}).text(getTimeFromUNIXStamp(curThread.last_post_ts, 0)),
					$tag = $('<span/>', {'class': 'mark'}),
					$title = $('<h6/>', {'class': 'title'}).text(curThread.subject.threeDots(22)),
					$sender = $('<strong/>', {'class': 'sender'}),
					$content = $("<p class='content'><strong>" + curThread.last_post_sender + "&nbsp;:&nbsp;</strong>" + curThread.last_post_preview.threeDots(70) + "</p>");
					// $('<p/>', {'class': 'content'});

				// $content.append($sender);
				$titleContainer.append($tag, $title, $content);
				$li.attr('link', threads[i].thread_api).append($titleContainer, $timeContainer);

				if(i < 3) {
					$favoriteContainer.append($li);
				}else if (i < 7) {
					$recentContainer.append($li);
				}else {
					$olderContainer.append($li.addClass('hide'));
				}
			}

			container.append($favoriteContainer, $recentContainer, $olderContainer);
			$('div.oFakeMessageLeftSideBar li.item').click(self.renderRightContent);
			$($('div.oFakeMessageLeftSideBar li.item')[0]).click();
			$('ul#leftSideOlder h6.olderTitle').click(function() {
				$(this).toggleClass('hidden-container');
				$('ul#leftSideOlder li.item').toggleClass('hide');
				self.correctMessageContentSize();
				scrollHandler();
			});
		},

		correctMessageContentSize: function() {
			$('div.oFakeMessageContent').css('min-height', 0);
			var verticalBound = Math.max($('body').height() - $('header').height() - 10,
										$('div.oFakeMessageContent').height(),
										$('div.oFakeMessageLeftSideBar').height());
			$('div.oFakeMessageContent').css('min-height', "" + verticalBound + "px");
		},

		/**
		 * Initialize scroll animation
		 * It's needed for left chat room list bar.
		 */
		scrollEventInit: function() {


			$(window).scroll(function() {
				if (scrollTimer)
					clearTimeout(scrollTimer);

				scrollTimer = setTimeout(scrollHandler, 500);
			});
		},

		/**
		 * Render message content
		 */
		renderRightContent: function(event) {
			event.preventDefault();
			$('div.oFakeMessageLeftSideBar li.item.active').removeClass('active');
			$(this).addClass('active');
			//
			var threadURL = "http://www.odesk.com/" + $(this).attr('link'),
				$container = $('div.oFakeMessageContent').css('min-height', "" + ($('body').height() - $('header').height() - 12) + "px"),
				$body = $('<div/>', {'class': 'contentBody'}),
				$posts = $('<div/>', {'class': 'posts'}),
				$titleBar = $('div.oFakeMessageContent div.contentTopBar h6#contentTopTitle');

			$.getJSON(threadURL, function(response) {
				var posts = response.thread.posts;

				$('div.oFakeMessageContent > div.contentBody').remove();
				$titleBar.text(response.thread.subject);
				for( var i = 0; i < posts.length; i++ ) {
					var curPost = posts[i],
						$article = $('<article/>', {'class': 'post'}),
						$photo = $('<span/>', {'class': 'photo'}),
						$photoImage = $('<img/>', {'src': links[getRandomInt(0, 3)]}),
						$messageContainer = $('<div/>', {'class': 'messageContainer'}),
						$time = $('<h6/>', {'class': 'time'}).text(getTimeFromUNIXStamp(parseInt(curPost.created_ts), 1)),
						messageString = '<p class="message"><strong>' + curPost.sender_username + "&nbsp;" + '</strong><br/>';

					$photo.append($photoImage);

					var lines = curPost.content.split('\n');
					var regEx = /\[\[(.+?)\|(.+?)\]\]/;
					for ( var j = 0; j < lines.length; j++ ) {
						var curLine = lines[j];
						var matches = regEx.exec(curLine);

						if (matches == null)
						{
							messageString += curLine + "<br/>";
							
						} else if (matches.length == 3) {
							messageString += "<a href='" + matches[1] + "'>" + matches[2] + "</a><br/>";
						} else {
							console.log("Please test Here...................");
						}
					}

					if (curPost.attachments != "") {
						var attachments = curPost.attachments;
						for (var j = 0; j < attachments.length; j++) {
							var curAttach = attachments[j];
							messageString += '<a href="' + curAttach.url + '" tooltip="' + curAttach.filesize + 'bytes">' + curAttach.filename + '</a>';
						}
					}

					messageString += "</p>'";
					$messageContainer.append($time, $(messageString));
					$article.append($photo, $messageContainer);
					$posts.append($article);
				}
				$body.append($posts);

				/**
				 * Adding reply
				 </form>
				 */
				var $article = $('<article/>', {'class': 'jsPost'}),
					$form = $('<form/>', {'class': 'oFormTop', 'novalidate': 'novalidate', 'id': 'inbox_reply_form'}),
					$div = $('<div/>', {'class': 'oFormField'}),
					$label = $('<label', {'class': 'oLabel'}).text("Reply"),
					$textarea = $('<textarea/>', {'name': 'body', 'class': 'oForm'}),
					$controlDiv = $('<div/>', {'class': 'oCountdown oHidden'}).append($('<span>50000</span> characters left')),
					$ul = $('<ul class="oFieldValue oFormLrg oPlainList jsFormAttachments"><li class="oAttachmentAddBlock"><span tabindex="0" class="oLink jsUploadOptions" data-rel="flyout" data-class-name="oModal" data-reveal="#uploadOptionsContainer" data-trigger="click">+</span><aside class="oHidden" id="uploadOptionsContainer"><ul><li tabindex="1"></li><li tabindex="2"><div class="oInputFileContainer"><div class="oInputFileWrapper"><input class="ignored" type="file" name="attachment" data-target="image_uploader_1"></div><div class="jsAttachmentAddItem">Upload a file</div></div></li><li tabindex="3" class="jsDropbox"><div>Share via dropbox</div></li></ul></aside><div class="oDropHere isHidden"><div><span class="oTxtMega">Drop File Here</span></div></div></li><li class="oAttachmentUploading isHidden"><div class="oLoadingSmallInline"></div> <a class="oBtnCloseAttachment txtMiddle jsAttachmentCancel" href="#" title="Cancel"></a></li></ul>'),
					$button = $('<button type="submit" class="oBtn oBtnSecondary">Post</button>');

				$form.append($div.append($label, $textarea, $controlDiv, $ul, $button));
				$article.append($form);

				$posts.append($article);
				$container.append($body);
				self.correctMessageContentSize();
				self.scrollEventInit();
			});
			
		}
	};

	var self = window.oDeskMessage = new oDeskMessage();

})(window);