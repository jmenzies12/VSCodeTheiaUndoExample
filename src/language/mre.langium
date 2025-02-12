grammar Mre

entry Model:
    (entries+=Entry)*;

Entry:
    'entry' id=INT ':' description=STRING;

hidden terminal WS: /\s+/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
