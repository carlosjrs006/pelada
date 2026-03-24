package com.peladasabado.api;

import com.peladasabado.api.model.Jogador;
import com.peladasabado.api.service.JogadorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

/**
 * Semeia os mensalistas base na primeira execução (quando o banco está vazio).
 */
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private JogadorService jogadorService;

    @Override
    public void run(String... args) {
        if (jogadorService.count() > 0) {
            System.out.println("✅ Banco já populado — seed ignorado.");
            return;
        }

        List<String[]> jogadores = Arrays.asList(
            // nome, tipo, estrelas
            new String[]{"Renato",          "mensalista", "3"},
            new String[]{"Yasser",          "mensalista", "3"},
            new String[]{"Edgar",           "mensalista", "3"},
            new String[]{"Leandro",         "mensalista", "3"},
            new String[]{"Karlos Nardelly", "mensalista", "3"},
            new String[]{"Carlos Jr",       "mensalista", "3"},
            new String[]{"Lucas Vilela",    "mensalista", "3"},
            new String[]{"Rafael",          "mensalista", "3"},
            new String[]{"Matheus",         "mensalista", "3"},
            new String[]{"Amarildo Jr",     "mensalista", "3"},
            new String[]{"Vinicius",        "mensalista", "3"},
            new String[]{"Marcos Neves",    "mensalista", "3"},
            new String[]{"Gustavo",         "mensalista", "3"}
        );

        for (String[] d : jogadores) {
            Jogador j = new Jogador();
            j.setNome(d[0]);
            j.setTipo(d[1]);
            j.setEstrelas(Integer.parseInt(d[2]));
            j.setAtivo(true);
            jogadorService.create(j);
        }

        System.out.println("✅ Seed concluído — 13 mensalistas cadastrados.");
    }
}
