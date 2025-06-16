module.exports = function (plop) {
  // コンポーネント生成
  plop.setGenerator('component', {
    description: 'UIコンポーネントを作成',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'コンポーネント名を入力してください:',
        validate: (value) => {
          if (/.+/.test(value)) {
            return true;
          }
          return '名前は必須です';
        },
      },
      {
        type: 'list',
        name: 'type',
        message: 'コンポーネントの種類を選択してください:',
        choices: ['shared', 'feature'],
        default: 'shared',
      },
      {
        type: 'input',
        name: 'feature',
        message: '機能名を入力してください (featureの場合):',
        when: (answers) => answers.type === 'feature',
      },
    ],
    actions: (data) => {
      const actions = [];
      const path = data.type === 'shared' 
        ? 'src/shared/ui/{{name}}'
        : 'src/features/{{feature}}/components/{{name}}';

      // コンポーネントファイル
      actions.push({
        type: 'add',
        path: `${path}/{{name}}.tsx`,
        templateFile: '__plop-templates__/component/component.tsx.hbs',
      });

      // インデックスファイル
      actions.push({
        type: 'add',
        path: `${path}/index.ts`,
        templateFile: '__plop-templates__/component/index.ts.hbs',
      });

      return actions;
    },
  });

  // モデル生成
  plop.setGenerator('model', {
    description: 'モデル（スキーマ、型定義）を作成',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'モデル名を入力してください:',
        validate: (value) => {
          if (/.+/.test(value)) {
            return true;
          }
          return '名前は必須です';
        },
      },
      {
        type: 'input',
        name: 'feature',
        message: '機能名を入力してください:',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/features/{{feature}}/model/{{camelCase name}}Schema.ts',
        templateFile: '__plop-templates__/model/schema.ts.hbs',
      },
    ],
  });

  // APIフック生成
  plop.setGenerator('api-hook', {
    description: 'API用のカスタムフックを作成',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'フック名を入力してください (use〜 の形式):',
        validate: (value) => {
          if (/^use[A-Z]/.test(value)) {
            return true;
          }
          return 'フック名は "use" で始まり、その後に大文字で始まる名前が続く必要があります';
        },
      },
      {
        type: 'input',
        name: 'feature',
        message: '機能名を入力してください:',
      },
      {
        type: 'list',
        name: 'type',
        message: 'APIフックの種類を選択してください:',
        choices: ['query', 'mutation'],
        default: 'query',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/features/{{feature}}/api/{{name}}.ts',
        templateFile: (data) => 
          data.type === 'query' 
            ? '__plop-templates__/api-hook/query.ts.hbs' 
            : '__plop-templates__/api-hook/mutation.ts.hbs',
      },
    ],
  });
};
