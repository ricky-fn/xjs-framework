export default function evalWithContext(content, context) {
    content = content.replace(/&amp;/g, '&');
    return (new Function('with(this){return ' + content + '}')).call(context);
}