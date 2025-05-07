<?php

namespace App\Form;

use App\Entity\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class UserType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('firstname')
            ->add('lastname')
            ->add('email')
            ->add('password')
            ->add('phone')
            ->add('siret')
            ->add('is_active')
            ->add('is_deleted')
            ->add('created_at')
            ->add('created_by')
            ->add('updated_by')
            ->add('updated_at')
            ->add('max_session')
            ->add('price_per_hour')
            ->add('id_center')
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => User::class,
        ]);
    }
}
