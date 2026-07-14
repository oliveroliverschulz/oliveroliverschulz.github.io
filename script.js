/* Oliver Schulz — rendert alle Seiten aus content.json */

(function () {
	'use strict';

	var page = document.body.getAttribute('data-page');
	var main = document.getElementById('content');

	// Aktiven Menüpunkt markieren
	document.querySelectorAll('.site-nav a').forEach(function (a) {
		if (a.getAttribute('data-nav') === page) a.classList.add('active');
	});

	fetch('content.json?v=' + Date.now())
		.then(function (r) { return r.json(); })
		.then(render)
		.catch(function (e) {
			main.innerHTML = '<p>Content could not be loaded.</p>';
			console.error(e);
		});

	// ---------- Helpers ----------

	function esc(s) {
		return String(s == null ? '' : s)
			.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
	}

	function paragraphs(text) {
		return String(text || '').split(/\n\s*\n/).filter(Boolean)
			.map(function (p) { return '<p>' + esc(p).replace(/\n/g, '<br>') + '</p>'; })
			.join('');
	}

	function imageHtml(src, alt) {
		return '<img src="' + esc(src) + '" alt="' + esc(alt || '') + '" loading="lazy">';
	}

	// Zwei-Klick-YouTube: erst nach Klick wird youtube-nocookie.com geladen
	function videoHtml(video) {
		return '<div class="video-block">' +
			'<div class="video-placeholder" data-yt="' + esc(video.youtube_id) + '" role="button" tabindex="0">' +
				'<span class="play"></span>' +
				(video.title ? '<span class="video-title">' + esc(video.title) + '</span>' : '') +
				'<span class="video-note">Click to load the video. Only then a connection to YouTube (youtube-nocookie.com) is established.</span>' +
			'</div>' +
		'</div>';
	}

	function activateVideos(root) {
		root.querySelectorAll('.video-placeholder').forEach(function (ph) {
			function load() {
				var id = ph.getAttribute('data-yt');
				var iframe = document.createElement('iframe');
				iframe.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0';
				iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
				iframe.setAttribute('allowfullscreen', '');
				ph.replaceWith(iframe);
			}
			ph.addEventListener('click', load);
			ph.addEventListener('keydown', function (e) {
				if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); load(); }
			});
		});
	}

	function mediaHtml(entry) {
		var html = '';
		var imgs = entry.images || [];
		if (imgs.length) {
			html += '<div class="entry-gallery">' + imgs.map(function (src) {
				return imageHtml(src, entry.title || '');
			}).join('') + '</div>';
		}
		(entry.videos || []).forEach(function (v) { html += videoHtml(v); });
		return html;
	}

	// ---------- Render ----------

	function render(c) {
		document.getElementById('footer-copy').textContent =
			'© ' + new Date().getFullYear() + ' ' + c.site.name;

		switch (page) {
			case 'home': renderHome(c); break;
			case 'exhibitions': renderExhibitions(c); break;
			case 'projects': renderProjects(c); break;
			case 'project': renderProject(c); break;
			case 'about': renderAbout(c); break;
			case 'contact': renderContact(c); break;
			case 'impressum': renderLegal(c.legal.impressum, 'Impressum'); break;
			case 'datenschutz': renderLegal(c.legal.datenschutz, 'Datenschutz'); break;
		}
		activateVideos(main);
		wireNewsletter(main);

		// Anker (z. B. #newsletter aus dem Footer) erst nach dem Rendern anspringen
		if (location.hash) {
			var target = document.querySelector(location.hash);
			if (target) target.scrollIntoView();
		}
	}

	function renderHome(c) {
		var h = '';
		if (c.home.image) {
			h += '<figure class="home-figure">' + imageHtml(c.home.image, c.home.caption) +
				(c.home.caption ? '<figcaption class="home-caption">' + esc(c.home.caption) + '</figcaption>' : '') +
			'</figure>';
		}
		if (c.home.text) h += '<div class="text-col" style="margin-top:28px">' + paragraphs(c.home.text) + '</div>';
		main.innerHTML = h;
	}

	function exhibitionHtml(ex) {
		var first = (ex.images || [])[0];
		var rest = { images: (ex.images || []).slice(1), videos: ex.videos, title: ex.title };
		return '<article class="entry">' +
			(first ? '<div class="entry-image">' + imageHtml(first, ex.title) + '</div>' : '') +
			'<div class="entry-venue">' + esc(ex.venue) + (ex.city ? ', ' + esc(ex.city) : '') + '</div>' +
			(ex.title ? '<div class="entry-title">' + esc(ex.title) + '</div>' : '') +
			(ex.info ? '<div class="entry-info">' + esc(ex.info) + '</div>' : '') +
			(ex.dateText ? '<div class="entry-date">' + esc(ex.dateText) + '</div>' : '') +
			(ex.text ? '<div class="entry-text">' + paragraphs(ex.text) + '</div>' : '') +
			mediaHtml(rest) +
		'</article>';
	}

	function renderExhibitions(c) {
		var upcoming = c.exhibitions.filter(function (e) { return e.status === 'upcoming'; })
			.sort(function (a, b) { return (a.date || '').localeCompare(b.date || ''); });
		var past = c.exhibitions.filter(function (e) { return e.status !== 'upcoming'; })
			.sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });

		var h = '';
		if (upcoming.length) {
			h += '<h1 class="section-heading">Upcoming</h1>' + upcoming.map(exhibitionHtml).join('');
		}
		if (past.length) {
			h += '<h1 class="section-heading">Past</h1>' + past.map(exhibitionHtml).join('');
		}
		main.innerHTML = h || '<p>No exhibitions yet.</p>';
	}

	function renderProjects(c) {
		var h = c.projects.map(function (p) {
			var url = 'project.html?p=' + encodeURIComponent(p.slug);
			return '<article class="entry">' +
				(p.cover ? '<div class="entry-image"><a href="' + url + '">' + imageHtml(p.cover, p.title) + '</a></div>' : '') +
				'<div class="entry-venue"><a href="' + url + '">' + esc(p.title) + '</a></div>' +
				(p.year ? '<div class="entry-date">' + esc(p.year) + '</div>' : '') +
				(p.teaser ? '<div class="entry-text">' + paragraphs(p.teaser) + '</div>' : '') +
				'<a class="entry-more" href="' + url + '">More →</a>' +
			'</article>';
		}).join('');
		main.innerHTML = h || '<p>No projects yet.</p>';
	}

	function renderProject(c) {
		var slug = new URLSearchParams(location.search).get('p');
		var p = c.projects.find(function (x) { return x.slug === slug; });
		if (!p) {
			main.innerHTML = '<p>Project not found. <a href="projects.html">Back to projects</a></p>';
			return;
		}
		document.title = p.title + ' — ' + c.site.name;
		var h = '<a class="back-link" href="projects.html">← Projects</a>' +
			'<div class="project-head"><h1>' + esc(p.title) + '</h1>' +
			(p.year ? '<div class="project-year">' + esc(p.year) + '</div>' : '') + '</div>' +
			(p.cover ? '<div class="entry-image">' + imageHtml(p.cover, p.title) + '</div>' : '') +
			(p.text ? '<div class="project-text">' + paragraphs(p.text) + '</div>' : '');
		var imgs = p.images || [];
		if (imgs.length) {
			h += '<div class="project-gallery">' + imgs.map(function (src) {
				return imageHtml(src, p.title);
			}).join('') + '</div>';
		}
		(p.videos || []).forEach(function (v) { h += videoHtml(v); });
		main.innerHTML = h;
	}

	function newsletterHtml(c) {
		var n = c.newsletter || {};
		var inner;
		if (n.action_url) {
			// Brevo-Formular: sendet erst beim Absenden Daten an Brevo, kein Fremd-Script.
			// Antwort kommt als JSON und wird inline angezeigt (siehe wireNewsletter).
			inner = '<form class="newsletter-form" method="POST" action="' + esc(n.action_url) + '">' +
				'<input type="email" name="EMAIL" required placeholder="E-mail address" autocomplete="email">' +
				// Brevo-Spamschutz (Honeypot) + Sprache
				'<input type="text" name="email_address_check" value="" style="display:none" tabindex="-1" autocomplete="off">' +
				'<input type="hidden" name="locale" value="de">' +
				'<button type="submit">Subscribe</button>' +
			'</form>' +
			'<p class="newsletter-msg" role="status"></p>' +
			'<p class="newsletter-hint">Double opt-in: you will receive a confirmation e-mail. Details in the <a href="datenschutz.html">privacy policy</a>.</p>';
		} else {
			// Fallback ohne Anbieter: Anmeldung per E-Mail
			inner = '<p class="newsletter-hint"><a href="mailto:' + esc(c.site.email) +
				'?subject=Newsletter%20subscription&body=Please%20add%20me%20to%20the%20newsletter.">Subscribe by e-mail</a> — ' +
				'send a short message and you will be added to the list.</p>';
		}
		return '<div class="newsletter-block" id="newsletter"><h2>' + esc(n.heading || 'Newsletter') + '</h2>' +
			(n.text ? '<p>' + esc(n.text) + '</p>' : '') + inner + '</div>';
	}

	// Newsletter-Formular per fetch absenden und Brevo-Antwort inline anzeigen
	function wireNewsletter(root) {
		var form = root.querySelector('.newsletter-form');
		if (!form || !form.action) return;
		form.addEventListener('submit', function (e) {
			e.preventDefault();
			var btn = form.querySelector('button');
			var msg = form.parentNode.querySelector('.newsletter-msg');
			btn.disabled = true;
			msg.textContent = '…';
			fetch(form.action, { method: 'POST', body: new FormData(form) })
				.then(function (r) { return r.json(); })
				.then(function (res) {
					if (res.success) {
						msg.textContent = 'Thank you! Please check your inbox and confirm your subscription.';
						form.reset();
					} else {
						msg.textContent = res.message || 'Something went wrong. Please try again.';
					}
				})
				.catch(function () {
					// Fallback: klassisch absenden (zeigt dann Brevos eigene Antwort)
					form.submit();
				})
				.finally(function () { btn.disabled = false; });
		});
	}

	function renderAbout(c) {
		var a = c.about;
		var h = '';
		if (a.portrait) h += '<div class="about-portrait">' + imageHtml(a.portrait, c.site.name) + '</div>';
		if (a.intro) h += '<div class="about-text"><strong>' + esc(a.intro) + '</strong></div>';
		if (a.bio) h += '<div class="about-text">' + esc(a.bio) + '</div>';
		(a.cv || []).forEach(function (sec) {
			h += '<div class="cv-section"><h2>' + esc(sec.section) + '</h2><ul>' +
				sec.items.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') +
			'</ul></div>';
		});
		h += contactBlockHtml(c);
		h += newsletterHtml(c);
		main.innerHTML = h;
	}

	function contactBlockHtml(c) {
		var ct = c.contact;
		var h = '<div class="contact-block"><h2 class="section-heading">Contact</h2>';
		if (ct.text) h += '<p>' + esc(ct.text) + '</p>';
		if (ct.email) h += '<p><a href="mailto:' + esc(ct.email) + '">' + esc(ct.email) + '</a></p>';
		if (ct.phone) h += '<p>' + esc(ct.phone) + '</p>';
		if (ct.address) h += '<p>' + esc(ct.address) + '</p>';
		if (ct.instagram) h += '<p><a href="' + esc(ct.instagram) + '" rel="noopener" target="_blank">Instagram</a></p>';
		h += '</div>';
		return h;
	}

	function renderContact(c) {
		main.innerHTML = contactBlockHtml(c) + newsletterHtml(c);
	}

	function renderLegal(text, title) {
		main.innerHTML = '<div class="legal-text"><h1>' + esc(title) + '</h1>' + paragraphs(text) + '</div>';
	}
})();
