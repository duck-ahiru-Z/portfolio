document.addEventListener('DOMContentLoaded', () => {
  // Modal Elements
  const modal = document.getElementById('unified-modal');
  const modalContent = document.getElementById('modal-content');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  // Unified Modal Control
  if (modal && modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => modal.close());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.close();
    });
  }

  // ==========================================================================
  // About Me: README.md Fetch & Parse Pop-up
  // ==========================================================================
  const aboutDetailBtn = document.getElementById('about-detail-btn');
  if (aboutDetailBtn) {
    aboutDetailBtn.addEventListener('click', () => {
      openReadmeModal();
    });
  }

  function openReadmeModal() {
    if (!modal || !modalContent) return;

    modalContent.innerHTML = `<p class="loading-text">Loading profile from README.md...</p>`;
    modal.showModal();

    fetch('./README.md')
      .then(res => {
        if (!res.ok) throw new Error('README.md が見つかりませんでした。');
        return res.text();
      })
      .then(markdown => {
        if (window.marked) {
          modalContent.innerHTML = `<div class="markdown-body">${marked.parse(markdown)}</div>`;
        } else {
          throw new Error('marked.js パーサーがロードされていません。');
        }
      })
      .catch(error => {
        modalContent.innerHTML = `
          <div class="error-box" style="border: 1px solid #c83c28; padding: 1.5rem; background-color: #fbf1f0; border-radius: 4px;">
            <h3 style="color: #c83c28; margin-bottom: 0.5rem; font-weight: bold;">読み込みエラー</h3>
            <p style="font-size: 0.9rem; line-height: 1.6;">${error.message}</p>
            <hr style="margin: 1rem 0; border: 0; border-top: 1px solid rgba(200, 60, 40, 0.2);">
            <p style="font-size: 0.8rem; color: #666; line-height: 1.6;">
              <strong>ローカルで直接開いている場合（file://）:</strong><br>
              ブラウザのセキュリティ上の制約（CORS）により、README.mdの非同期読み込みがブロックされています。<br>
              ローカルで表示を確認するには、ViteやVS Codeの拡張機能（Live Server等）、または簡易サーバーを起動してアクセスしてください。
            </p>
          </div>
        `;
      });
  }

  // ==========================================================================
  // Unified Detail Modal for Products & Awards & Activities
  // ==========================================================================
  function openDetailModal(title, tags, desc, behindText, links = []) {
    if (!modal || !modalContent) return;

    const tagsHtml = tags.length > 0 
      ? `<div class="tag-list" style="margin-top: 0.5rem; margin-bottom: 0;">${tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>`
      : '';

    const linksHtml = links.length > 0
      ? `<div class="modal-links">${links.map(l => `<a href="${l.url}" target="_blank" rel="noopener noreferrer" class="modal-link-btn">${l.name} &rarr;</a>`).join('')}</div>`
      : '';

    modalContent.innerHTML = `
      <div class="modal-section" style="margin-bottom: 2rem;">
        <h3>${title}</h3>
        ${tagsHtml}
      </div>
      
      <div class="modal-section">
        <div class="modal-section-title">Description</div>
        <p class="modal-desc">${desc}</p>
      </div>
      
      ${behindText ? `
        <div class="modal-section">
          <div class="modal-section-title">Behind The Scenes (開発秘話・裏話)</div>
          <div class="modal-secret">${behindText}</div>
        </div>
      ` : ''}

      ${linksHtml}
    `;

    modal.showModal();
  }

  // ==========================================================================
  // DATA FETCH & INITIALIZATION (Promise.all による一括並行ロード)
  // ==========================================================================
  const dataPaths = [
    './data/profile.json',
    './data/products.json',
    './data/awards.json',
    './data/activities.json',
    './data/reading.json',
    './data/certifications.json',
    './data/links.json'
  ];

  Promise.all(dataPaths.map(url => fetch(url).then(res => {
    if (!res.ok) throw new Error(`${url} のロードに失敗しました。`);
    return res.json();
  })))
  .then(([profile, products, awards, activities, reading, certifications, links]) => {
    initializePortfolio({ profile, products, awards, activities, reading, certifications, links });
  })
  .catch(error => {
    showErrorFallback(error.message);
  });

  // CORSエラー等でのエラーフォールバック描画
  function showErrorFallback(message) {
    const mainContainer = document.getElementById('main-container');
    if (!mainContainer) return;

    mainContainer.innerHTML = `
      <div class="error-box" style="border: 1px solid #c83c28; padding: 2rem; background-color: #fbf1f0; border-radius: 4px; margin-top: 4rem; max-width: 700px; margin-left: auto; margin-right: auto;">
        <h2 style="color: #c83c28; margin-bottom: 0.8rem; font-weight: bold; border-bottom: none; font-size: 1.5rem;">データの読み込みに失敗しました</h2>
        <p style="font-size: 0.95rem; line-height: 1.6;">${message}</p>
        <hr style="margin: 1.5rem 0; border: 0; border-top: 1px solid rgba(200, 60, 40, 0.2);">
        <p style="font-size: 0.85rem; color: #555; line-height: 1.7;">
          <strong>【CORS制限についてのアシスト】</strong><br>
          HTMLファイルをブラウザに直接ドラッグ＆ドロップ（<code>file://</code>）で開いている場合、ブラウザのセキュリティ機能（CORS）によってデータファイル（JSON）の非同期読み込みがブロックされます。<br><br>
          表示を確認するには、以下のいずれかの方法で簡易Webサーバーを起動してください：
        </p>
        <ul style="font-size: 0.85rem; color: #555; margin-top: 0.8rem; padding-left: 1.5rem; line-height: 1.7;">
          <li>VS Codeの拡張機能「Live Server」などを利用して「Go Live」で起動する</li>
          <li>Node.js環境がある場合: コマンドラインで <code>npx http-server</code> を実行する</li>
          <li>Python環境がある場合: コマンドラインで <code>python -m http.server 8000</code> を実行する</li>
        </ul>
      </div>
    `;
  }

  // ==========================================================================
  // HELPER: Chornological Data Sorting (新しい順・古い順の判定)
  // ==========================================================================
  const sortData = (data, order) => {
    return [...data].sort((a, b) => {
      const dateA = a.date || "0000.00";
      const dateB = b.date || "0000.00";
      if (order === 'desc') {
        return dateB.localeCompare(dateA); // 新しい順 (降順)
      } else {
        return dateA.localeCompare(dateB); // 古い順 (昇順)
      }
    });
  };

  // ==========================================================================
  // PORTFOLIO GENERATION LOGIC
  // ==========================================================================
  function initializePortfolio(datasets) {
    // 0. Profile & Hero Section (JSONから動的バインド)
    const heroTitle = document.getElementById('hero-title');
    const heroSubtitle = document.getElementById('hero-subtitle');
    const heroAvatarImg = document.getElementById('hero-avatar-img');
    const profileAffiliation = document.getElementById('profile-affiliation');
    const profileGroup = document.getElementById('profile-group');
    const profileSummary = document.getElementById('profile-summary');

    if (heroTitle) heroTitle.textContent = datasets.profile.name;
    if (heroSubtitle) heroSubtitle.textContent = datasets.profile.catchphrase;
    if (profileAffiliation) profileAffiliation.innerHTML = `<strong>所属:</strong> ${datasets.profile.affiliation}`;
    if (profileGroup) profileGroup.innerHTML = `<strong>所属団体:</strong> ${datasets.profile.group}`;
    if (profileSummary) profileSummary.textContent = datasets.profile.summary;

    // アバター画像の動的バインド (指定があれば上書き)
    if (heroAvatarImg && datasets.profile.avatar) {
      heroAvatarImg.src = datasets.profile.avatar;
    }

    // Contact情報の動的バインド (スパム対策表示)
    const contactEmail = document.getElementById('contact-email');
    const contactNote = document.getElementById('contact-note');
    if (contactEmail && datasets.profile.email) {
      contactEmail.textContent = datasets.profile.email;
    }
    if (contactNote && datasets.profile.contactNote) {
      contactNote.textContent = datasets.profile.contactNote;
    }

    // 1. Products Section (アコーディオン ＆ 動的技術タグフィルター ＆ 日付順ソート)
    setupProductsSection(datasets.products);

    // 2. Awards Section (アコーディオン ＆ 日付順ソート)
    setupAwardsSection(datasets.awards);

    // 3. Activities Section (News & Activities アコーディオン ＆ 日付順ソート)
    setupActivitiesSection(datasets.activities);

    // 4. Reading List Section
    renderReadingList(datasets.reading);

    // 5. Certifications Section
    renderCertifications(datasets.certifications);

    // 6. Column Selectors (プルダウン列数選択)
    setupColumnSelector('products-col-select', ['products-featured-grid', 'products-expanded-grid'], '1', '2');
    setupColumnSelector('reading-col-select', ['reading-grid'], '3', '4');

    // 7. Links Section
    renderLinks(datasets.links);
  }

  // ==========================================================================
  // ① Products Section Setup (開閉トグル ＆ タグフィルター ＆ 日付ソート)
  // ==========================================================================
  function setupProductsSection(products) {
    const featuredGrid = document.getElementById('products-featured-grid');
    const expandedGrid = document.getElementById('products-expanded-grid');
    const toggleLink = document.getElementById('toggle-products-btn');
    const sortBtn = document.getElementById('sort-products-btn');
    const filterContainer = document.getElementById('products-filter-container');
    const sectionElement = featuredGrid.closest('section');

    if (!featuredGrid || !expandedGrid || !toggleLink) return;

    let isExpanded = false;
    let activeFilter = 'All';
    let sortOrder = 'desc'; // デフォルト：新しい順

    // A. フィルタータグの動的抽出と描画
    const uniqueTags = ['All'];
    products.forEach(p => {
      p.tags.forEach(t => {
        if (!uniqueTags.includes(t)) uniqueTags.push(t);
      });
    });

    if (filterContainer) {
      filterContainer.innerHTML = '';
      uniqueTags.forEach(tag => {
        const chip = document.createElement('button');
        chip.className = `filter-chip ${tag === activeFilter ? 'active' : ''}`;
        chip.textContent = tag;
        chip.addEventListener('click', () => {
          filterContainer.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');

          activeFilter = tag;
          render();
        });
        filterContainer.appendChild(chip);
      });
    }

    // B. プロダクトレンダリングのリアクティブ制御
    const render = () => {
      featuredGrid.innerHTML = '';
      expandedGrid.innerHTML = '';

      // ソート順の適用
      const sortedProducts = sortData(products, sortOrder);

      if (activeFilter === 'All') {
        toggleLink.style.display = 'inline-block';

        if (isExpanded) {
          // すべて表示時: 全商品を区別なくソート順で1つのグリッドに描画
          sortedProducts.forEach(p => featuredGrid.appendChild(createProductCard(p)));
          expandedGrid.style.display = 'none';
          toggleLink.textContent = `[ 閉じる ]`;
        } else {
          // 閉じている時: Featuredのみをソート順で描画
          const featured = sortedProducts.filter(p => p.isFeatured);
          featured.forEach(p => featuredGrid.appendChild(createProductCard(p)));
          expandedGrid.style.display = 'none';
          toggleLink.textContent = `[ すべて表示 (全${products.length}件) ]`;
        }
      } else {
        // フィルター適用時: 該当タグの全作品をソート順で描画
        toggleLink.style.display = 'none';
        expandedGrid.style.display = 'none';

        const filtered = sortedProducts.filter(p => p.tags.includes(activeFilter));
        filtered.forEach(p => featuredGrid.appendChild(createProductCard(p)));
      }
    };

    // C. ヘッダートグルリンクのイベント
    toggleLink.addEventListener('click', () => {
      if (isExpanded) {
        isExpanded = false;
        render();
        if (sectionElement) sectionElement.scrollIntoView({ behavior: 'smooth' });
      } else {
        isExpanded = true;
        render();
      }
    });

    // D. ソート切り替えボタンのイベント
    if (sortBtn) {
      sortBtn.addEventListener('click', () => {
        sortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
        sortBtn.innerHTML = sortOrder === 'desc' ? '新しい順 &darr;' : '古い順 &uarr;';
        render();
      });
    }

    render();
  }

  // ==========================================================================
  // ② Awards Section Setup (ヘッダートグル ＆ 日付ソート)
  // ==========================================================================
  function setupAwardsSection(awards) {
    const featuredContainer = document.getElementById('awards-featured-list');
    const expandedContainer = document.getElementById('awards-expanded-list');
    const toggleLink = document.getElementById('toggle-awards-btn');
    const sortBtn = document.getElementById('sort-awards-btn');
    const sectionElement = featuredContainer.closest('section');

    if (!featuredContainer || !expandedContainer || !toggleLink) return;
    let isExpanded = false;
    let sortOrder = 'desc'; // デフォルト: 新しい順

    const render = () => {
      featuredContainer.innerHTML = '';
      expandedContainer.innerHTML = '';

      const sortedAwards = sortData(awards, sortOrder);

      if (isExpanded) {
        // すべて表示時: 全受賞歴を区別なくソート順で1つのリストに描画
        sortedAwards.forEach(a => featuredContainer.appendChild(createAwardItem(a)));
        expandedContainer.style.display = 'none';
        toggleLink.textContent = `[ 閉じる ]`;
      } else {
        // 閉じている時: Featuredのみをソート順で描画
        const featured = sortedAwards.filter(a => a.isFeatured);
        featured.forEach(a => featuredContainer.appendChild(createAwardItem(a)));
        expandedContainer.style.display = 'none';
        toggleLink.textContent = `[ すべて表示 (全${awards.length}件) ]`;
      }
    };

    toggleLink.addEventListener('click', () => {
      if (isExpanded) {
        isExpanded = false;
        render();
        if (sectionElement) sectionElement.scrollIntoView({ behavior: 'smooth' });
      } else {
        isExpanded = true;
        render();
      }
    });

    if (sortBtn) {
      sortBtn.addEventListener('click', () => {
        sortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
        sortBtn.innerHTML = sortOrder === 'desc' ? '新しい順 &darr;' : '古い順 &uarr;';
        render();
      });
    }

    render();
  }

  // ==========================================================================
  // ③ Activities Section Setup (News & Activities ＆ 日付ソート)
  // ==========================================================================
  function setupActivitiesSection(activities) {
    const featuredContainer = document.getElementById('activities-featured-list');
    const expandedContainer = document.getElementById('activities-expanded-list');
    const toggleLink = document.getElementById('toggle-activities-btn');
    const sortBtn = document.getElementById('sort-activities-btn');
    const sectionElement = featuredContainer.closest('section');

    if (!featuredContainer || !expandedContainer || !toggleLink) return;
    let isExpanded = false;
    let sortOrder = 'desc'; // デフォルト: 新しい順

    const render = () => {
      featuredContainer.innerHTML = '';
      expandedContainer.innerHTML = '';

      const sortedActivities = sortData(activities, sortOrder);

      if (isExpanded) {
        // すべて表示時: 全活動歴を区別なくソート順で1つのリストに描画
        sortedActivities.forEach(act => featuredContainer.appendChild(createActivityItem(act)));
        expandedContainer.style.display = 'none';
        toggleLink.textContent = `[ 閉じる ]`;
      } else {
        // 閉じている時: Featuredのみをソート順で描画
        const featured = sortedActivities.filter(act => act.isFeatured);
        featured.forEach(act => featuredContainer.appendChild(createActivityItem(act)));
        expandedContainer.style.display = 'none';
        toggleLink.textContent = `[ すべて表示 (全${activities.length}件) ]`;
      }
    };

    toggleLink.addEventListener('click', () => {
      if (isExpanded) {
        isExpanded = false;
        render();
        if (sectionElement) sectionElement.scrollIntoView({ behavior: 'smooth' });
      } else {
        isExpanded = true;
        render();
      }
    });

    if (sortBtn) {
      sortBtn.addEventListener('click', () => {
        sortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
        sortBtn.innerHTML = sortOrder === 'desc' ? '新しい順 &darr;' : '古い順 &uarr;';
        render();
      });
    }

    render();
  }

  // ==========================================================================
  // COLUMN SELECTOR CONTROLLER (動的な列数変更)
  // ==========================================================================
  function setupColumnSelector(selectId, gridIds, mobileDefault, pcDefault) {
    const select = document.getElementById(selectId);
    if (!select) return;

    const grids = gridIds.map(id => document.getElementById(id)).filter(el => el !== null);
    if (grids.length === 0) return;

    // 画面幅に基づき、デフォルト列数を初期設定
    const isMobile = window.innerWidth < 768;
    const defaultVal = isMobile ? mobileDefault : pcDefault;
    select.value = defaultVal;

    const apply = (cols) => {
      grids.forEach(grid => {
        grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      });
    };

    // 初期反映
    apply(defaultVal);

    // プルダウン変更イベント
    select.addEventListener('change', (e) => {
      apply(e.target.value);
    });
  }

  // ==========================================================================
  // RENDER ITEM BUILDERS
  // ==========================================================================

  // ① Product Card
  function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'card';

    const tagsHtml = product.tags.map(t => `<span class="tag">${t}</span>`).join('');
    const imageHtml = product.image 
      ? `<img src="${product.image}" alt="${product.title}" class="card-image" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
         <div class="image-placeholder" style="display:none;">[ NO IMAGE ]</div>`
      : `<div class="image-placeholder">[ NO IMAGE ]</div>`;

    card.innerHTML = `
      <div class="card-image-wrapper">
        ${imageHtml}
      </div>
      <div class="card-body">
        <div style="font-size: 0.72rem; font-family: monospace; font-weight: bold; color: var(--text-muted); margin-bottom: 0.15rem;">${product.date || ''}</div>
        <h3 class="card-title">${product.title}</h3>
        <p class="card-desc">${product.shortDescription}</p>
        <div class="tag-list">${tagsHtml}</div>
        <button class="card-btn">詳細を見る</button>
      </div>
    `;

    card.querySelector('.card-btn').addEventListener('click', () => {
      const links = [];
      if (product.productUrl) links.push({ name: 'Demo', url: product.productUrl });
      if (product.githubUrl) links.push({ name: 'GitHub', url: product.githubUrl });
      
      openDetailModal(
        product.title, 
        product.tags, 
        product.detailedDescription, 
        product.behindTheScenes, 
        links
      );
    });

    return card;
  }

  // ② Award List Item
  function createAwardItem(award) {
    const item = document.createElement('div');
    item.className = 'list-item';

    item.innerHTML = `
      <div class="list-date">${award.date}</div>
      <div class="list-content">
        <h3 class="list-title">${award.title}</h3>
        <p class="list-desc">${award.description}</p>
        <button class="list-btn">詳細・裏話を見る</button>
      </div>
    `;

    item.querySelector('.list-btn').addEventListener('click', () => {
      const links = [];
      if (award.link) links.push({ name: '関連リンク', url: award.link });
      openDetailModal(
        award.title, 
        [], 
        award.description, 
        award.behindTheScenes, 
        links
      );
    });

    return item;
  }

  // ③ Activity List Item
  function createActivityItem(act) {
    const item = document.createElement('div');
    item.className = 'list-item';

    item.innerHTML = `
      <div class="list-date">${act.date}</div>
      <div class="list-content">
        <h3 class="list-title">${act.title}</h3>
        <p class="list-desc">${act.description}</p>
        ${act.behindTheScenes ? `<button class="list-btn">詳細・裏話を見る</button>` : ''}
      </div>
    `;

    if (act.behindTheScenes) {
      item.querySelector('.list-btn').addEventListener('click', () => {
        openDetailModal(
          act.title, 
          [], 
          act.description, 
          act.behindTheScenes
        );
      });
    }

    return item;
  }

  // ④ Reading List (Books)
  function renderReadingList(reading) {
    const readingContainer = document.getElementById('reading-grid');
    if (!readingContainer) return;

    readingContainer.innerHTML = '';
    reading.forEach(book => {
      const card = document.createElement('div');
      card.className = 'book-card';

      const tagsHtml = book.tags.map(t => `<span class="tag">${t}</span>`).join('');
      const imageHtml = book.image 
        ? `<img src="${book.image}" alt="${book.title}" class="book-cover" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
           <div class="image-placeholder" style="display:none;">[ NO COVER ]</div>`
        : `<div class="image-placeholder">[ NO COVER ]</div>`;

      card.innerHTML = `
        <div class="book-cover-wrapper">
          ${imageHtml}
        </div>
        <div class="book-info">
          <div class="book-title" title="${book.title}">${book.title}</div>
          <div class="book-author">${book.author}</div>
          <div class="tag-list" style="margin-top:auto; margin-bottom:0; gap:0.25rem;">${tagsHtml}</div>
        </div>
      `;
      readingContainer.appendChild(card);
    });
  }

  // ⑤ Certifications
  function renderCertifications(certifications) {
    const certsContainer = document.getElementById('certifications-container');
    if (!certsContainer) return;

    certsContainer.innerHTML = '';
    certifications.forEach(cert => {
      const li = document.createElement('li');
      
      const badgeHtml = cert.isAcquired 
        ? `<span class="tag tag-favorite" style="font-size:0.65rem; margin-left:0.4rem; padding:0.1rem 0.3rem;">取得済</span>`
        : `<span class="tag" style="font-size:0.65rem; margin-left:0.4rem; padding:0.1rem 0.3rem;">取得目標</span>`;

      li.innerHTML = `
        <div>
          <span class="cert-date">${cert.date}</span>
          <span class="cert-title">${cert.title}</span>
          ${badgeHtml}
        </div>
        ${cert.description ? `<p class="cert-desc">${cert.description}</p>` : ''}
      `;
      certsContainer.appendChild(li);
    });
  }

  // ⑥ Links List
  function renderLinks(links) {
    const linksContainer = document.getElementById('links-container');
    if (!linksContainer) return;

    linksContainer.innerHTML = '';
    links.forEach(link => {
      const li = document.createElement('li');
      li.innerHTML = `
        <a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.name}</a>
        <span class="url-desc">- ${link.description}</span>
      `;
      linksContainer.appendChild(li);
    });
  }
});
