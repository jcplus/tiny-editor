'use strict';
/**
 * TinyLingual is a tiny string converter which converts English string to a
 * matching translated string.
 *
 * @author James Chen <jcplus@gmail.com>
 * @version 0.0.1
 * @param  {String} languageCode Either navigator.language or manual input
 * @return {String}              Translated string or source string if not found
 */
var TinyLingual = function (languageCode) {
    'use strict';

    if (typeof languageCode === 'undefined') {
        throw this.TL.convert('Language code is required!');
    }

    if (typeof languageCode !== 'string' || languageCode.trim() === '') {
        throw this.TL.convert('Language code must be a valid string!');
    }

    switch (languageCode) {
        case 'zh-CN':
        case 'zh-TW':
            this.language = 'chinese';
            break;

        case 'ja-JP':
            this.language = 'japanese';
            break;

        default:
            this.language = 'english';
            break;
    }

    this.languagePack = {
        'Container selector of the editor is required!': {
            'english': 'Container selector of the editor is required!',
            'chinese': '必须传入编辑器容器的选择器！',
            'japanese': 'エディタのコンテナセレクタが必要です！'
        },
        'Container selector of the editor must be a valid string!': {
            'english': 'Container selector must be a valid string!',
            'chinese': '编辑器容器的选择器不能为空！',
            'japanese': 'コンテナセレクタは有効な文字列でなければなりません！'
        },
        'Language code is required!': {
            'english': 'Language code is required!',
            'chinese': '必须传入语言代号！',
            'japanese': '言語コードが必要です！'
        },
        'Language code must be a valid string!': {
            'english': 'Language code must be a valid string!',
            'chinese': '语言代号不能为空！',
            'japanese': '言語コードは有効な文字列でなければなりません！'
        },
        'Source string is required!': {
            'english': 'Source string is required!',
            'chinese': '必须传入来源字串！',
            'japanese': 'ソース文字列が必要です！'
        },
        'Source string must be a valid string!': {
            'english': 'Source string must be a valid string!',
            'chinese': '来源字串不能为空！',
            'japanese': 'ソース文字列は有効な文字列である必要があります！'
        },
        'Cannot find matching translation of the source string.': {
            'english': 'Cannot find matching translation of the source string.',
            'chinese': '找不到对应来源字串的翻译',
            'japanese': 'ソース文字列と一致する翻訳が見つかりません'
        },
        'Cannot locate editor element by "%s"!': {
            'english': 'Cannot locate editor element by "%s"!',
            'chinese': '找不到选择器为“%s”的元素！',
            'japanese': '"％s"でエディタ要素が見つかりません！'
        },
        '"%s" cannot be empty!': {
            'english': '"%s" cannot be empty!',
            'chinese': '“%s”不能为空！',
            'japanese': '"％s"は空にできません！'
        },
        'Web Image': {
            'english': 'Web Image',
            'chinese': '网络图片',
            'japanese': 'ネットワーク図'
        },
        'Upload': {
            'english': 'Upload',
            'chinese': '本地图片',
            'japanese': '本地图片'
        },
        'Drop Here': {
            'english': 'Drop Here',
            'chinese': '拖曳至此',
            'japanese': '拖曳至此'
        },
        'Upload': {
            'english': 'Upload',
            'chinese': '上传',
            'japanese': 'アップロード'
        },
        'Cancel': {
            'english': 'Cancel',
            'chinese': '取消',
            'japanese': 'キャンセル'
        },
        'Choose File': {
            'english': 'Choose File',
            'chinese': '选取文件',
            'japanese': 'ファイルを選択'
        }
    };

    this.convert = function () {
        if (!arguments.length) {
            throw this.languagePack['Source string is required!'][this.language];
        }

        // Arguments object is not a real Array
        // Convert it to a real array in strict mode is safer
        var args = Array.prototype.slice.call(arguments);

        // Source string
        var source = args[0];

        // Remove the souce string
        args.splice(0, 1);

        if (typeof source !== 'string' && source.trim() === '') {
            throw this.languagePack['Source string must be a valid string!'][this.language];
        }

        if (this.languagePack.hasOwnProperty(source) && this.languagePack[source].hasOwnProperty(this.language)) {
            return this.repalce(this.languagePack[source][this.language], args);
        }

        console.log(this.convert('Cannot find matching translation of the source string.'));
        return this.repalce(source, arguments);
    };

    /**
     * Replace the reserved symbols in the source string with given parameters
     *
     * @param  {String} source String to be replaced
     * @param  {Array}  args   Array of parameters to replace
     * @return {String}        Final string
     */
    this.repalce = function (source, args) {
        if (!args.length) {
            return source;
        }

        var result = '',
            tempStr = source.split('%s');

        for (var i = 0; i < tempStr.length; i ++) {
            result += tempStr[i];
            if (args.hasOwnProperty(i)) {
                 result += args[i];
            }
        }
        return result;
    };
};
