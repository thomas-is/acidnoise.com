<?php

define("SRV", dirname(__DIR__).DIRECTORY_SEPARATOR );

class config {

    const DIR_ROOT      = SRV;
    const DIR_PHP       = self::DIR_ROOT."php".DIRECTORY_SEPARATOR;
    const DIR_WWW       = self::DIR_ROOT."www".DIRECTORY_SEPARATOR;

    const CMS_HTML_TITLE    = "Acid Noise";
    const CMS_HTML_LANG     = "en";
    const CMS_HTML_CHARSET  = "utf-8";
    const CMS_DIR_STATIC    = self::DIR_ROOT."static".DIRECTORY_SEPARATOR;
    const CMS_DIR_PAGES     = self::DIR_ROOT."pages".DIRECTORY_SEPARATOR;
    const CMS_DIR_CSS       = "res".DIRECTORY_SEPARATOR;
    const CMS_DIR_JS        = "res".DIRECTORY_SEPARATOR;

}
?>
