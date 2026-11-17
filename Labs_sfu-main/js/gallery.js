(function ($) {
    'use strict';

    /* -------- 1. Проверка подключения jQuery и jQuery UI -------- */
    console.log('%c[jQuery] версия: ' + $.fn.jquery, 'color:#43b8d6;font-weight:bold');
    if ($.ui) {
        console.log('[jQuery UI] версия:', $.ui.version);
    } else {
        console.warn('[jQuery UI] библиотека не подключена!');
    }

    /* -------- Вариант анимации (по заданию) -------- */
    var ANIMATION_EFFECT   = 'bounce';                       // варианты: blind, bounce, clip, drop, explode, fade, fold, highlight, puff, pulsate, scale, shake, size, slide, transfer
    var ANIMATION_DURATION = 800;
    var ANIMATION_OPTIONS  = { times: 2, distance: 12 };

    $(function () {
        console.log('%c[jQuery] DOM готов. jQuery работает.', 'color:#109fab');

        var state = {
            all: [],
            filtered: [],
            currentIndex: 0,
            sliderOffset: 0
        };

        var $progress     = $('#gallery-progress');
        var $progressText = $('#gallery-progress-text');
        var $caption      = $('#gallery-caption');
        var $largeImg     = $('#gallery-large-img');
        var $track        = $('#slider-track');
        var $viewport     = $('.gallery-slider-viewport');

        /* ============================================================
           2. AJAX-загрузка JSON-файла с описанием галереи
           ============================================================ */
        $.ajax({
            url: 'gallery.json',
            dataType: 'json',
            cache: false,
            success: function (data) {
                console.log('[AJAX] JSON загружен:', data);
                state.all = data.images || [];
                $('#gallery .section-title').text(data.gallery || 'Галерея');
                initGallery();
            },
            error: function (xhr, status, error) {
                console.error('[AJAX] Ошибка:', status, error);
                $caption.text('Не удалось загрузить галерею. Проверьте gallery.json');
            }
        });

        function initGallery() {
            initProgressbar();
            initTabs();
            initSliderControls();
            initLargeControls();
            initAccordion();
            initDatepicker();
            initToggleClassButton();

            applyFilter('all'); // первичное заполнение
        }

        /* ============================================================
           6. Progressbar статуса загрузки изображений
           ============================================================ */
        function initProgressbar() {
            $progress.progressbar({ value: 0 });
            $progressText.text('0%');

            var total = state.all.length;
            if (!total) {
                $progress.progressbar('value', 100);
                $progressText.text('Нет изображений');
                return;
            }

            var loaded = 0;
            function onLoaded() {
                loaded++;
                var percent = Math.round((loaded / total) * 100);
                $progress.progressbar('value', percent);
                $progressText.text(percent === 100 ? 'Готово (100%)' : percent + '%');
            }

            state.all.forEach(function (img) {
                var pre = new Image();
                pre.onload = onLoaded;
                pre.onerror = onLoaded;
                pre.src = img.file;
            });
        }

        /* ============================================================
           7. Tabs — переключение категорий
           ============================================================ */
        function initTabs() {
            $('#gallery-tabs').tabs({
                activate: function (event, ui) {
                    var cat = $(ui.newPanel).data('category') || 'all';
                    applyFilter(cat);
                    // подсветка выбранной вкладки
                    $(ui.newPanel).effect('highlight', { color: '#43b8d6' }, 600);
                }
            });
        }

        function applyFilter(cat) {
            state.filtered = (cat === 'all')
                ? state.all.slice()
                : state.all.filter(function (img) { return img.category === cat; });

            state.currentIndex = 0;
            state.sliderOffset = 0;

            renderThumbnails();

            if (state.filtered.length) {
                showLarge(0, false);
            } else {
                $largeImg.attr('src', '').hide();
                $caption.text('В этой категории пока нет фотографий');
            }
        }

        /* ============================================================
           Рендер миниатюр
           ============================================================ */
        function renderThumbnails() {
            $track.empty();

            state.filtered.forEach(function (img, i) {
                var $thumb = $('<div class="gallery-thumb" tabindex="0">')
                    .attr('data-index', i)
                    .append($('<img>').attr({ src: img.file, alt: img.name, loading: 'lazy' }))
                    .append($('<span class="gallery-thumb__name">').text(img.name));

                $thumb.on('click', function () { showLarge(i, true); });
                $thumb.on('keydown', function (e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        showLarge(i, true);
                    }
                });

                $track.append($thumb);
            });
            updateSliderPosition();
        }

        /* ============================================================
           3. Slider: прокрутка миниатюр
           ============================================================ */
        function initSliderControls() {
            $('#slider-prev').on('click', function () { moveSlider(-1); });
            $('#slider-next').on('click', function () { moveSlider(1); });
        }

        function moveSlider(direction) {
            var $thumbs = $track.children('.gallery-thumb');
            if (!$thumbs.length) return;

            var step = $thumbs.outerWidth(true);
            var maxOffset = Math.max(0, $thumbs.length * step - $viewport.width());

            state.sliderOffset += direction * step * 2;
            if (state.sliderOffset < 0) state.sliderOffset = 0;
            if (state.sliderOffset > maxOffset) state.sliderOffset = maxOffset;
            updateSliderPosition();
        }

        function updateSliderPosition() {
            $track.css('transform', 'translateX(-' + state.sliderOffset + 'px)');
        }

        /* ============================================================
           1 + 2. Показ изображения с увеличением + переход к след.
           ============================================================ */
        function initLargeControls() {
            $('#gallery-prev').on('click', function () {
                showLarge(state.currentIndex - 1, true);
            });
            $('#gallery-next').on('click', function () {
                showLarge(state.currentIndex + 1, true);
            });

            $(document).on('keydown.gallery', function (e) {
                if (!$('#gallery').length) return;
                if (e.key === 'ArrowLeft')  $('#gallery-prev').trigger('click');
                if (e.key === 'ArrowRight') $('#gallery-next').trigger('click');
            });
        }

        function showLarge(index, animate) {
            if (!state.filtered.length) return;

            // цикличный переход
            index = (index + state.filtered.length) % state.filtered.length;
            state.currentIndex = index;

            var img = state.filtered[index];
            $largeImg.show().attr({ src: img.file, alt: img.name });
            $caption.text(img.name + '  (' + (index + 1) + ' из ' + state.filtered.length + ')');

            // выбранная миниатюра
            $track.children('.gallery-thumb')
                .removeClass('is-active')
                .eq(index).addClass('is-active');

            ensureThumbVisible(index);

            // эффект анимации (вариант Bounce)
            if (animate) {
                $largeImg.effect(ANIMATION_EFFECT, ANIMATION_OPTIONS, ANIMATION_DURATION);
            }
        }

        function ensureThumbVisible(index) {
            var $thumbs = $track.children('.gallery-thumb');
            if (!$thumbs.length) return;

            var step = $thumbs.outerWidth(true);
            var viewportW = $viewport.width();
            var left = index * step;
            var right = left + step;

            if (left < state.sliderOffset) {
                state.sliderOffset = left;
            } else if (right > state.sliderOffset + viewportW) {
                state.sliderOffset = right - viewportW;
            }
            updateSliderPosition();
        }

        /* ============================================================
           4. Accordion (jQuery UI)
           ============================================================ */
        function initAccordion() {
            $('#gallery-accordion').accordion({
                collapsible: true,
                heightStyle: 'content',
                active: 0
            });
        }

        /* ============================================================
           5. Datepicker (jQuery UI)
           ============================================================ */
        function initDatepicker() {
            $('#gallery-datepicker').datepicker({
                dateFormat: 'dd.mm.yy',
                changeMonth: true,
                changeYear: true,
                showAnim: 'fadeIn',
                onSelect: function (dateText) {
                    $caption.text('Выбранная дата съёмки: ' + dateText);
                }
            });
        }

        /* ============================================================
           8. toggleClass — смена классов по нажатию кнопки
           ============================================================ */
        function initToggleClassButton() {
            $('#gallery-toggle-class').on('click', function () {
                // jQuery UI .toggleClass() поддерживает анимацию
                $track.children('.gallery-thumb').toggleClass('gallery-thumb--alt', 400);
                $('.gallery-large').toggleClass('gallery-large--alt', 400);
            });
        }
    });
})(jQuery);