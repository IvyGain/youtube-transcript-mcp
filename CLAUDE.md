################################################################################
# YouTube Transcript MCP Server - Complete Setup Guide in YAML
################################################################################

project:
  name: youtube-transcript-mcp
  version: 1.0.0
  description: MCP server for YouTube video transcripts with Live URL support
  author: Your Name
  license: MIT
  node_version: ">=18.0.0"
  repository: https://github.com/YOUR_USERNAME/youtube-transcript-mcp

################################################################################
# STEP 1: プロジェクト構造
################################################################################

directory_structure:
  root:
    path: youtube-transcript-mcp/
    contents:
      files:
        - package.json
        - tsconfig.json
        - README.md
        - LICENSE
        - .gitignore
      directories:
        src:
          path: src/
          files:
            - index.ts
            - youtube-parser.ts
            - transcript-service.ts
            - types.ts
        examples:
          path: examples/
          files:
            - claude-desktop-config.json
        github:
          path: .github/
          subdirectories:
            workflows:
              path: .github/workflows/
              files:
                - publish.yml
        dist:
          path: dist/
          note: "npm run buildで自動生成"
          generated_files:
            - index.js
            - index.js.map
            - index.d.ts
            - youtube-parser.js
            - youtube-parser.js.map
            - youtube-parser.d.ts
            - transcript-service.js
            - transcript-service.js.map
            - transcript-service.d.ts
            - types.js
            - types.js.map
            - types.d.ts

################################################################################
# STEP 2: 各ファイルの完全な内容
################################################################################

files:
  # ==========================================================================
  # package.json - プロジェクト設定
  # ==========================================================================
  package_json:
    filename: package.json
    location: ./
    content:
      name: youtube-transcript-mcp
      version: 1.0.0
      description: MCP server for YouTube video transcripts with Live URL support
      main: dist/index.js
      type: module
      bin:
        youtube-transcript-mcp: ./dist/index.js
      scripts:
        build: tsc
        dev: tsc --watch
        start: node dist/index.js
        test: jest
        lint: eslint src/**/*.ts
        prepare: npm run build
        prepublishOnly: npm test && npm run lint
      keywords:
        - mcp
        - model-context-protocol
        - youtube
        - transcript
        - subtitles
        - youtube-live
        - claude
        - ai-agent
      author: Your Name
      license: MIT
      dependencies:
        "@modelcontextprotocol/sdk": ^0.5.0
        "youtube-transcript": ^1.2.1
      devDependencies:
        "@types/node": ^20.11.0
        "@typescript-eslint/eslint-plugin": ^6.19.0
        "@typescript-eslint/parser": ^6.19.0
        "eslint": ^8.56.0
        "jest": ^29.7.0
        "ts-jest": ^29.1.1
        "typescript": ^5.3.3
      engines:
        node: ">=18.0.0"
      repository:
        type: git
        url: git+https://github.com/yourusername/youtube-transcript-mcp.git
      bugs:
        url: https://github.com/yourusername/youtube-transcript-mcp/issues
      homepage: https://github.com/yourusername/youtube-transcript-mcp#readme

  # ==========================================================================
  # tsconfig.json - TypeScript設定
  # ==========================================================================
  tsconfig_json:
    filename: tsconfig.json
    location: ./
    content:
      compilerOptions:
        target: ES2022
        module: ES2022
        lib:
          - ES2022
        outDir: ./dist
        rootDir: ./src
        strict: true
        esModuleInterop: true
        skipLibCheck: true
        forceConsistentCasingInFileNames: true
        moduleResolution: node
        resolveJsonModule: true
        declaration: true
        declarationMap: true
        sourceMap: true
        noUnusedLocals: true
        noUnusedParameters: true
        noImplicitReturns: true
        noFallthroughCasesInSwitch: true
      include:
        - src/**/*
      exclude:
        - node_modules
        - dist
        - tests

  # ==========================================================================
  # .gitignore - Git除外設定
  # ==========================================================================
  gitignore:
    filename: .gitignore
    location: ./
    content: |
      # Dependencies
      node_modules/
      
      # Build output
      dist/
      build/
      
      # TypeScript
      *.tsbuildinfo
      
      # Logs
      logs/
      *.log
      npm-debug.log*
      yarn-debug.log*
      yarn-error.log*
      
      # Environment
      .env
      .env.local
      .env.development.local
      .env.test.local
      .env.production.local
      
      # IDE
      .vscode/
      .idea/
      *.swp
      *.swo
      *~
      .DS_Store
      
      # Testing
      coverage/
      *.lcov
      .nyc_output/
      
      # Temporary
      tmp/
      temp/
      *.tmp
      
      # Cache
      .cache/
      .npm/
      .yarn/
      
      # OS
      Thumbs.db
      Desktop.ini

################################################################################
# STEP 3: ソースコードファイル
################################################################################

source_files:
  # ==========================================================================
  # src/types.ts - 型定義
  # ==========================================================================
  types_ts:
    filename: src/types.ts
    purpose: TypeScript型定義
    exports:
      - VideoInfo
      - TranscriptResponse
      - TranscriptSegment
      - SearchResult
      - SummaryResult
      - ErrorResponse
    interfaces:
      VideoInfo:
        properties:
          originalUrl: string
          videoId: "string | null"
          normalizedUrl: "string | null"
          isLiveUrl: boolean
          urlType: string
      TranscriptResponse:
        properties:
          text: string
          start: number
          duration: number
      TranscriptSegment:
        properties:
          text: string
          start: number
          duration: number
          timestamp: string
      SearchResult:
        properties:
          keyword: string
          totalResults: number
          results: TranscriptSegment[]
          videoId: string

  # ==========================================================================
  # src/youtube-parser.ts - URL解析モジュール
  # ==========================================================================
  youtube_parser_ts:
    filename: src/youtube-parser.ts
    purpose: YouTube URL解析とビデオID抽出
    class: YouTubeURLParser
    methods:
      public:
        - parseURL(url: string): VideoInfo
        - extractMultipleVideoIds(urls: string[]): Map<string, string | null>
        - normalizeURL(url: string): string | null
        - getThumbnailURL(url: string, quality: string): string | null
      private:
        - extractVideoId(url: string): string | null
        - isValidVideoId(id: string): boolean
        - isLiveURL(url: string): boolean
        - detectURLType(url: string): string
    supported_url_formats:
      - standard: youtube.com/watch?v=VIDEO_ID
      - shortened: youtu.be/VIDEO_ID
      - embed: youtube.com/embed/VIDEO_ID
      - live: youtube.com/live/VIDEO_ID
      - shorts: youtube.com/shorts/VIDEO_ID
      - mobile: m.youtube.com/watch?v=VIDEO_ID

  # ==========================================================================
  # src/transcript-service.ts - 文字起こしサービス
  # ==========================================================================
  transcript_service_ts:
    filename: src/transcript-service.ts
    purpose: YouTube文字起こしの取得と処理
    class: TranscriptService
    dependencies:
      - youtube-transcript
    cache: Map<string, TranscriptResponse[]>
    methods:
      public:
        - getTranscript(videoId, language, format): Promise<string | TranscriptResponse[]>
        - searchInTranscript(videoId, keyword, language): Promise<SearchResult>
        - getTranscriptSegment(videoId, startTime, endTime, language): Promise<TranscriptSegment[]>
        - summarizeTranscript(videoId, language, maxLength): Promise<any>
        - clearCache(): void
      private:
        - formatTranscript(transcript, format): string | TranscriptResponse[]
        - toSRT(transcript): string
        - toVTT(transcript): string
        - formatTimestamp(seconds): string
        - formatSRTTime(seconds): string
        - formatVTTTime(seconds): string
        - createSimpleSummary(text, maxLength): string
        - extractKeyPhrases(text): string[]
        - getErrorMessage(error, videoId, language): string
        - delay(ms): Promise<void>
    retry_logic:
      max_retries: 3
      retry_delay: 5000
      retry_conditions:
        - Live配信中
        - 一時的なネットワークエラー

  # ==========================================================================
  # src/index.ts - MCPサーバーメイン
  # ==========================================================================
  index_ts:
    filename: src/index.ts
    purpose: MCPサーバーのエントリーポイント
    shebang: "#!/usr/bin/env node"
    server_config:
      name: youtube-transcript-mcp
      version: 1.0.0
    tools:
      - name: get_transcript
        description: YouTube動画から文字起こしを取得
        parameters:
          url:
            type: string
            required: true
            description: YouTube動画のURL
          language:
            type: string
            required: false
            default: ja
            description: 言語コード
          format:
            type: string
            required: false
            default: text
            enum: [text, srt, vtt, json]
            description: 出力フォーマット
      - name: search_in_transcript
        description: 文字起こし内でキーワード検索
        parameters:
          url:
            type: string
            required: true
          keyword:
            type: string
            required: true
          language:
            type: string
            required: false
            default: ja
      - name: get_transcript_segment
        description: 特定時間範囲の文字起こしを取得
        parameters:
          url:
            type: string
            required: true
          start_time:
            type: number
            required: true
          end_time:
            type: number
            required: true
          language:
            type: string
            required: false
            default: ja
      - name: check_live_status
        description: URLがLive配信かチェック
        parameters:
          url:
            type: string
            required: true
      - name: summarize_transcript
        description: 動画の要約を生成
        parameters:
          url:
            type: string
            required: true
          language:
            type: string
            required: false
            default: ja
          max_length:
            type: number
            required: false
            default: 500

################################################################################
# STEP 4: セットアップコマンド
################################################################################

setup_commands:
  initial_setup:
    step_1_create_project:
      commands:
        - mkdir youtube-transcript-mcp
        - cd youtube-transcript-mcp
        - mkdir src
        - mkdir examples
        - mkdir -p .github/workflows
    
    step_2_create_files:
      note: 上記の各ファイルの内容をコピー＆ペースト
      files_to_create:
        - package.json
        - tsconfig.json
        - .gitignore
        - README.md
        - LICENSE
        - src/index.ts
        - src/youtube-parser.ts
        - src/transcript-service.ts
        - src/types.ts
    
    step_3_install_dependencies:
      commands:
        - npm install
        - npm run build
    
    step_4_verify_build:
      commands:
        - ls -la dist/
        - node dist/index.js --version

  github_setup:
    step_1_init_git:
      commands:
        - git init
        - git add .
        - git commit -m "Initial commit: YouTube Transcript MCP Server"
    
    step_2_create_github_repo:
      manual_steps:
        - GitHubにログイン
        - New repositoryをクリック
        - Repository name: youtube-transcript-mcp
        - Publicを選択
        - Create repositoryをクリック
    
    step_3_push_to_github:
      commands:
        - git remote add origin https://github.com/YOUR_USERNAME/youtube-transcript-mcp.git
        - git branch -M main
        - git push -u origin main

  npm_publish:
    optional: true
    requirements:
      - npmアカウント
      - npm login済み
    commands:
      - npm version patch
      - npm publish --access public

################################################################################
# STEP 5: Claude Desktop設定
################################################################################

claude_desktop_config:
  config_file_locations:
    macos:
      path: ~/Library/Application Support/Claude/claude_desktop_config.json
      open_command: open ~/Library/Application\ Support/Claude/claude_desktop_config.json
    linux:
      path: ~/.config/Claude/claude_desktop_config.json
      open_command: nano ~/.config/Claude/claude_desktop_config.json
    windows:
      path: "%APPDATA%\\Claude\\claude_desktop_config.json"
      open_command: notepad %APPDATA%\Claude\claude_desktop_config.json

  configuration_options:
    option_1_local_development:
      description: ローカル開発用（フルパス指定）
      config:
        mcpServers:
          youtube-transcript:
            command: node
            args:
              - /Users/YOUR_USERNAME/Desktop/youtube-transcript-mcp/dist/index.js
    
    option_2_global_install:
      description: グローバルインストール後
      install_command: npm install -g youtube-transcript-mcp
      config:
        mcpServers:
          youtube-transcript:
            command: youtube-transcript-mcp
            args: []
    
    option_3_npx:
      description: インストール不要（npx使用）
      config:
        mcpServers:
          youtube-transcript:
            command: npx
            args:
              - youtube-transcript-mcp

  restart_claude:
    steps:
      - Claude Desktopを完全に終了
      - 10秒待つ
      - Claude Desktopを再起動

################################################################################
# STEP 6: 使用方法
################################################################################

usage:
  basic_usage:
    get_transcript:
      prompt: https://youtube.com/live/w3PpSk--25c の文字起こしを取得して
      expected_behavior:
        - Live URLを標準URLに変換
        - ビデオIDを抽出
        - 文字起こしを取得
        - テキストを表示
    
    search_keyword:
      prompt: この動画で「React」について話している部分を探して
      expected_behavior:
        - 文字起こし全体を検索
        - マッチした部分をタイムスタンプ付きで表示
    
    get_segment:
      prompt: 2分から5分までの文字起こしを取得して
      expected_behavior:
        - 指定時間範囲を抽出
        - タイムスタンプ付きで表示
    
    check_live_status:
      prompt: このURLはLive配信ですか？
      expected_behavior:
        - URL形式をチェック
        - Live URLかどうかを判定
    
    summarize:
      prompt: この動画を要約して
      expected_behavior:
        - 文字起こし全体を取得
        - キーフレーズを抽出
        - 要約を生成

################################################################################
# STEP 7: トラブルシューティング
################################################################################

troubleshooting:
  common_errors:
    error_cannot_find_module:
      description: モジュールが見つからない
      causes:
        - npm installが未実行
        - buildが未実行
        - パスが間違っている
      solutions:
        - rm -rf node_modules package-lock.json
        - npm install
        - npm run build
        - パスを確認
    
    error_permission_denied:
      description: 実行権限がない
      causes:
        - ファイルの実行権限が不足
      solutions:
        - chmod +x dist/index.js
        - sudo npm install -g
    
    error_claude_not_recognizing:
      description: Claude Desktopが認識しない
      causes:
        - 設定ファイルのJSON構文エラー
        - パスが間違っている
        - Claude Desktopの再起動が必要
      solutions:
        - JSONの構文を確認
        - cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | python -m json.tool
        - 絶対パスを使用
        - Claude Desktopを完全に再起動
    
    error_transcript_not_available:
      description: 文字起こしが取得できない
      causes:
        - Live配信中
        - 動画が非公開
        - 字幕が無効
        - 年齢制限
      solutions:
        - 配信終了後15-30分待つ
        - 動画の公開設定を確認
        - 別の言語を試す
        - 認証が必要な場合は対応不可

  debug_commands:
    check_installation:
      - which node
      - node --version
      - npm --version
      - which youtube-transcript-mcp
    
    check_build:
      - ls -la dist/
      - node dist/index.js
    
    check_config:
      macos:
        - cat ~/Library/Application\ Support/Claude/claude_desktop_config.json
        - cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | jq .
    
    check_logs:
      macos:
        - tail -f ~/Library/Application\ Support/Claude/logs/main.log

################################################################################
# STEP 8: 追加機能の実装
################################################################################

additional_features:
  future_enhancements:
    - playlist_support:
        description: プレイリスト一括処理
        implementation: YouTubeプレイリストAPIの統合
    
    - real_time_transcription:
        description: リアルタイム文字起こし
        implementation: WebSocket接続でのストリーミング
    
    - multi_language_translation:
        description: 多言語自動翻訳
        implementation: 翻訳APIの統合
    
    - advanced_summarization:
        description: AI要約生成
        implementation: LLM APIの統合
    
    - export_formats:
        description: 追加エクスポート形式
        formats:
          - PDF
          - DOCX
          - TXT
          - CSV
    
    - web_ui:
        description: Web UIの追加
        tech_stack:
          - React
          - Next.js
          - Tailwind CSS

################################################################################
# STEP 9: テスト
################################################################################

testing:
  test_files:
    youtube_parser_test:
      file: tests/youtube-parser.test.ts
      test_cases:
        - parse_live_url
        - parse_standard_url
        - parse_shortened_url
        - extract_video_id
        - detect_url_type
    
    transcript_service_test:
      file: tests/transcript-service.test.ts
      test_cases:
        - get_transcript_success
        - get_transcript_error
        - search_keyword
        - format_timestamp
        - cache_functionality
  
  test_commands:
    - npm test
    - npm run test:watch
    - npm run test:coverage

################################################################################
# STEP 10: デプロイメント
################################################################################

deployment:
  github_actions:
    file: .github/workflows/publish.yml
    triggers:
      - on_release
      - on_push_to_main
      - manual_workflow_dispatch
    
    jobs:
      test:
        runs_on: ubuntu-latest
        node_versions:
          - 18.x
          - 20.x
          - 21.x
        steps:
          - checkout
          - setup_node
          - install_dependencies
          - run_tests
          - run_linter
      
      publish:
        runs_on: ubuntu-latest
        needs: test
        steps:
          - checkout
          - setup_node
          - install_dependencies
          - build
          - publish_to_npm
        secrets:
          - NPM_TOKEN

  npm_registry:
    registry_url: https://registry.npmjs.org
    package_name: youtube-transcript-mcp
    public_access: true
    version_strategy: semantic_versioning

################################################################################
# 完了チェックリスト
################################################################################

completion_checklist:
  project_setup:
    - [ ] プロジェクトフォルダを作成
    - [ ] すべてのファイルを作成
    - [ ] package.jsonを配置
    - [ ] tsconfig.jsonを配置
    - [ ] srcフォルダにTypeScriptファイルを配置
  
  build_process:
    - [ ] npm installを実行
    - [ ] npm run buildを実行
    - [ ] distフォルダが生成された
    - [ ] index.jsが存在する
  
  github_integration:
    - [ ] git initを実行
    - [ ] GitHubリポジトリを作成
    - [ ] git pushを実行
    - [ ] READMEが表示される
  
  claude_desktop_setup:
    - [ ] 設定ファイルを編集
    - [ ] パスを正しく設定
    - [ ] Claude Desktopを再起動
    - [ ] MCPが認識される
  
  functionality_test:
    - [ ] 通常のYouTube URLで動作
    - [ ] Live URLで動作
    - [ ] キーワード検索が動作
    - [ ] エラーハンドリングが動作