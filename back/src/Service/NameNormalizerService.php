<?php

namespace App\Service;

class NameNormalizerService
{
    public function normalizeName(string $name): string
    {
        if (empty($name)) {
            return '';
        }

        // Nettoyer et normaliser le nom
        $normalized = $this->cleanAndFormat($name);
        
        // Valider les caractères
        $normalized = $this->validateCharacters($normalized);
        
        return $normalized;
    }

    public function normalizeFirstname(string $firstname): string
    {
        if (empty($firstname)) {
            return '';
        }

        // Pour les prénoms composés (ex: "Jean-Pierre", "Marie Claire")
        $normalized = $this->cleanAndFormat($firstname, true);
        
        // Valider les caractères (prénoms peuvent avoir des traits d'union)
        $normalized = $this->validateCharacters($normalized, true);
        
        return $normalized;
    }

    private function cleanAndFormat(string $input, bool $isFirstname = false): string
    {
        // Supprimer les espaces en début/fin et multiples espaces
        $input = trim($input);
        $input = preg_replace('/\s+/', ' ', $input);
        
        // Convertir en minuscules puis capitaliser
        $input = mb_strtolower($input, 'UTF-8');
        
        if ($isFirstname) {
            // Pour les prénoms composés avec trait d'union ou espace
            $input = preg_replace_callback('/(\b\w+)/u', function($matches) {
                return mb_convert_case($matches[1], MB_CASE_TITLE, 'UTF-8');
            }, $input);
        } else {
            // Pour les noms de famille
            $input = mb_convert_case($input, MB_CASE_TITLE, 'UTF-8');
        }

        return $input;
    }

    private function validateCharacters(string $input, bool $allowHyphen = false): string
    {
        // Caractères autorisés : lettres, espaces, apostrophes
        $allowedPattern = '/[^a-zA-ZÀ-ÿ\s\']/u';
        
        if ($allowHyphen) {
            // Pour les prénoms, autoriser aussi les traits d'union
            $allowedPattern = '/[^a-zA-ZÀ-ÿ\s\'\-]/u';
        }
        
        // Supprimer les caractères non autorisés
        $cleaned = preg_replace($allowedPattern, '', $input);
        
        // Nettoyer les caractères spéciaux en double
        $cleaned = preg_replace('/[\'\-]{2,}/', '', $cleaned);
        $cleaned = preg_replace('/\s+/', ' ', $cleaned);
        
        return trim($cleaned);
    }

    /**
     * Valide si un nom/prénom est acceptable
     */
    public function isValidName(string $name, int $minLength = 2, int $maxLength = 50): bool
    {
        $normalized = trim($name);
        
        if (strlen($normalized) < $minLength || strlen($normalized) > $maxLength) {
            return false;
        }
        
        // Vérifier qu'il contient au moins une lettre
        if (!preg_match('/[a-zA-ZÀ-ÿ]/', $normalized)) {
            return false;
        }
        
        return true;
    }

    /**
     * Normalise un nom complet (prénom + nom)
     */
    public function normalizeFullName(string $firstname, string $lastname): array
    {
        return [
            'firstname' => $this->normalizeFirstname($firstname),
            'lastname' => $this->normalizeName($lastname)
        ];
    }

    /**
     * Détecte et corrige les erreurs communes
     */
    public function detectCommonErrors(string $input): string
    {
        // Corriger les doubles majuscules (ex: "JEAN" -> "Jean")
        if (mb_strtoupper($input, 'UTF-8') === $input) {
            return mb_convert_case($input, MB_CASE_TITLE, 'UTF-8');
        }
        
        // Corriger les noms tout en minuscules
        if (mb_strtolower($input, 'UTF-8') === $input) {
            return mb_convert_case($input, MB_CASE_TITLE, 'UTF-8');
        }
        
        return $input;
    }

    /**
     * Génère des suggestions en cas d'erreur
     */
    public function getSuggestions(string $input): array
    {
        $suggestions = [];
        
        if (!empty($input)) {
            // Suggestion de capitalisation
            $suggestions['capitalized'] = $this->normalizeName($input);
            
            // Suggestion sans caractères spéciaux
            $cleaned = preg_replace('/[^a-zA-ZÀ-ÿ\s]/', '', $input);
            if ($cleaned !== $input && !empty($cleaned)) {
                $suggestions['cleaned'] = $this->normalizeName($cleaned);
            }
        }
        
        return array_unique($suggestions);
    }
}