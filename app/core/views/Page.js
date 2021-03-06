define([

	'jquery',
	'underscore',
	'marionette',
    'handlebars',

	'app',
	'hbs!templates/layout/page',
    'hbs!templates/layout/page-tools',
    'hbs!templates/layout/page-footer'

], function ($, _, Marionette, Handlebars, App, template, tools, footer) {
	'use strict';

    var Layout = Marionette.LayoutView.extend({
        template: template,

        regions: {
            header: '#page-header',
            tools: '#page-tools',
            content: '#page-content',
            footer: '#page-footer'
        }
    });

    var Header = Marionette.ItemView.extend({
		className: 'panel-heading',
        template: Handlebars.compile('<h2>{{{this.title}}}</h2> {{#if this.subtitle}}<label class="color">{{{this.subtitle}}}</label>{{/if}} '),

        serializeData: function() {
            return this.options;
        }
    });

    var Content = Marionette.ItemView.extend({
        template: Handlebars.compile('{{{this.content}}}'),

        serializeData: function() {
			return this.options;
        }
    });

    var Tools = Marionette.ItemView.extend({
        template: tools,

        ui: {
            tool: '.panel-tools .btn'
        },

        events: {
            'click .panel-tools .btn': 'onToolItemClick'
        },

        serializeData: function() {
            return this.options;
        },

        onToolItemClick: function(event) {
            App.trigger('app:page:action', event);

            return false;
        }
    });

    var Footer = Marionette.ItemView.extend({
        template: footer,

        ui: {
            tool: '.panel-footer .btn'
        },

        events: {
            'click .panel-footer .btn': 'onToolItemClick'
        },

        serializeData: function() {
            return this.options;
        },

        onToolItemClick: function(event) {
            App.trigger('app:page:action', event);

            return false;
        }
    });

    return Backbone.Model.extend({

		layout: null,
		template: null,
		views: {},

        initialize: function(options) {
            this.layout = new Layout();

			this.setOptions(options);

            App.trigger('app:page:show', this.layout);

            if (this.template) {
                this.loadTemplate();
            } else {
                this.process();
            }
        },

		setOptions: function(options) {
			this.options = {};

			if (options.title) {
				this.set('title', options.title);
			}
			if (options.subtitle) {
				this.set('subtitle', options.subtitle);
			}
			if (options.content) {
				this.set('content', options.content);
			}
			if (options.tools) {
				this.set('tools', options.tools);
			}
            if (options.footer) {
                this.set('footer', options.footer);
            }
			if (options.template) {
				this.unset('template');
				this.template = options.template;
			}
		},

        loadTemplate: function() {
            require(['hbs!' + this.template], _.bind(function(template) {
                this.template = template;
                this.process();
            }, this));
        },

        process: function() {
            this.setHeader();
            this.setTools();
            this.setContent();
            this.setFooter();
            this.setBreadcrumb();
        },

        setHeader: function() {
			if (this.has('title')) {
				this.views.header = new Header(this.toJSON());
				this.layout.header.show(this.views.header);
			}
        },

        setTools: function() {
            if (this.has('tools')) {
                this.views.tools = new Tools(this.toJSON());
                this.layout.tools.show(this.views.tools);
            }
        },

        setFooter: function() {
            if (this.has('footer')) {
                this.views.footer = new Footer(this.toJSON());
                this.layout.footer.show(this.views.footer);
            }
        },

        setContent: function() {
            if (this.has('content') && typeof this.get('content') === "object") {
                this.views.content = this.get('content');
            } else {
				var options = new Backbone.Model(this.toJSON());

				if (this.template) {
					options.set('template', this.template);
				}

                this.views.content = new Content(options.toJSON());

				options.destroy();
            }

            this.layout.content.show(this.views.content);
        },

        setBreadcrumb: function() {
            var link = App.getCurrentRoute(),
                name = this.get('title');
            if (link !== '' && link !== '/' && link !== 'home') {
                App.breadcrumb.reset([{
                    'link': '#/' + link,
                    'name': name
                }]);
            } else {
                App.breadcrumb.reset([]);
            }
        }

    });
});