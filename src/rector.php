<?php

declare(strict_types=1);

use Rector\Config\RectorConfig;
use Rector\Doctrine\Set\DoctrineSetList;

return static function (RectorConfig $rectorConfig): void {
    // Appliquer le set pour convertir les annotations Doctrine en attributes
    $rectorConfig->sets([
        DoctrineSetList::DOCTRINE_ANNOTATIONS_TO_ATTRIBUTES,
    ]);
};
