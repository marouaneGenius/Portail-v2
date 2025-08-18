<?php

namespace App\Service;

class PhoneValidatorService
{
    /**
     * Normalise un numéro de téléphone français
     */
    public function normalizePhone(string $phone): string
    {
        if (empty($phone)) {
            return '';
        }

        // Nettoyer le numéro
        $cleaned = $this->cleanPhone($phone);
        
        // Normaliser au format français
        $normalized = $this->formatFrenchPhone($cleaned);
        
        return $normalized;
    }

    /**
     * Valide si un numéro de téléphone est correct
     */
    public function isValidPhone(string $phone): bool
    {
        if (empty($phone)) {
            return false;
        }

        $cleaned = $this->cleanPhone($phone);
        
        // Vérifications de base
        if (!$this->hasValidLength($cleaned)) {
            return false;
        }
        
        if (!$this->hasValidFormat($cleaned)) {
            return false;
        }
        
        if (!$this->hasValidPrefix($cleaned)) {
            return false;
        }
        
        return true;
    }

    /**
     * Nettoie un numéro de téléphone (supprime espaces, points, tirets, etc.)
     */
    private function cleanPhone(string $phone): string
    {
        // Supprimer tous les caractères non numériques sauf le +
        $cleaned = preg_replace('/[^\d+]/', '', $phone);
        
        // Gérer les préfixes internationaux courants
        if (str_starts_with($cleaned, '+33')) {
            $cleaned = '0' . substr($cleaned, 3);
        } elseif (str_starts_with($cleaned, '0033')) {
            $cleaned = '0' . substr($cleaned, 4);
        } elseif (str_starts_with($cleaned, '33') && strlen($cleaned) === 11) {
            $cleaned = '0' . substr($cleaned, 2);
        }
        
        return $cleaned;
    }

    /**
     * Formate un numéro au format français standard (XX XX XX XX XX)
     */
    private function formatFrenchPhone(string $cleaned): string
    {
        if (strlen($cleaned) !== 10 || !str_starts_with($cleaned, '0')) {
            return $cleaned; // Retourner tel quel si format invalide
        }
        
        return substr($cleaned, 0, 2) . ' ' . 
               substr($cleaned, 2, 2) . ' ' . 
               substr($cleaned, 4, 2) . ' ' . 
               substr($cleaned, 6, 2) . ' ' . 
               substr($cleaned, 8, 2);
    }

    /**
     * Vérifie la longueur du numéro
     */
    private function hasValidLength(string $cleaned): bool
    {
        return strlen($cleaned) === 10;
    }

    /**
     * Vérifie le format de base
     */
    private function hasValidFormat(string $cleaned): bool
    {
        // Doit commencer par 0 et contenir que des chiffres
        return preg_match('/^0\d{9}$/', $cleaned) === 1;
    }

    /**
     * Vérifie si le préfixe est valide pour un numéro français
     */
    private function hasValidPrefix(string $cleaned): bool
    {
        if (strlen($cleaned) < 2) {
            return false;
        }
        
        $prefix = substr($cleaned, 0, 2);
        
        // Préfixes valides en France
        $validPrefixes = [
            '01', // Île-de-France
            '02', // Nord-Ouest
            '03', // Nord-Est
            '04', // Sud-Est
            '05', // Sud-Ouest
            '06', // Mobiles
            '07', // Mobiles
            '08', // Numéros spéciaux
            '09', // Internet/VoIP
        ];
        
        return in_array($prefix, $validPrefixes, true);
    }

    /**
     * Génère des suggestions de correction
     */
    public function getSuggestions(string $phone): array
    {
        $suggestions = [];
        $cleaned = $this->cleanPhone($phone);
        
        if (!empty($cleaned)) {
            // Suggestion avec formatage
            if ($this->isValidPhone($phone)) {
                $formatted = $this->normalizePhone($phone);
                if ($formatted !== $phone) {
                    $suggestions['formatted'] = $formatted;
                }
            }
            
            // Suggestions de correction communes
            if (strlen($cleaned) === 9 && !str_starts_with($cleaned, '0')) {
                $suggestions['with_zero'] = $this->formatFrenchPhone('0' . $cleaned);
            }
            
            if (strlen($cleaned) === 11 && str_starts_with($cleaned, '33')) {
                $suggestions['french_format'] = $this->formatFrenchPhone('0' . substr($cleaned, 2));
            }
        }
        
        return array_unique(array_values($suggestions));
    }

    /**
     * Obtient le type de numéro (mobile, fixe, spécial)
     */
    public function getPhoneType(string $phone): string
    {
        $cleaned = $this->cleanPhone($phone);
        
        if (!$this->isValidPhone($phone)) {
            return 'invalid';
        }
        
        $prefix = substr($cleaned, 0, 2);
        
        return match($prefix) {
            '01', '02', '03', '04', '05' => 'landline',
            '06', '07' => 'mobile',
            '08' => 'special',
            '09' => 'voip',
            default => 'unknown'
        };
    }

    /**
     * Valide et formate en une seule opération
     */
    public function validateAndFormat(string $phone): array
    {
        $result = [
            'original' => $phone,
            'cleaned' => $this->cleanPhone($phone),
            'is_valid' => false,
            'formatted' => '',
            'type' => 'invalid',
            'suggestions' => []
        ];
        
        $result['is_valid'] = $this->isValidPhone($phone);
        
        if ($result['is_valid']) {
            $result['formatted'] = $this->normalizePhone($phone);
            $result['type'] = $this->getPhoneType($phone);
        } else {
            $result['suggestions'] = $this->getSuggestions($phone);
        }
        
        return $result;
    }

    /**
     * Valide pour les numéros internationaux (basique)
     */
    public function isValidInternationalPhone(string $phone): bool
    {
        $cleaned = preg_replace('/[^\d+]/', '', $phone);
        
        // Format international basique
        if (str_starts_with($cleaned, '+')) {
            return preg_match('/^\+[1-9]\d{6,14}$/', $cleaned) === 1;
        }
        
        return false;
    }
}