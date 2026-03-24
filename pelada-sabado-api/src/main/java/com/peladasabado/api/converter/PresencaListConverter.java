package com.peladasabado.api.converter;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.peladasabado.api.model.PresencaPelada;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;
import java.util.ArrayList;
import java.util.List;

@Converter
public class PresencaListConverter implements AttributeConverter<List<PresencaPelada>, String> {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(List<PresencaPelada> attribute) {
        if (attribute == null || attribute.isEmpty()) return "[]";
        try {
            return MAPPER.writeValueAsString(attribute);
        } catch (Exception e) {
            return "[]";
        }
    }

    @Override
    public List<PresencaPelada> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) return new ArrayList<>();
        try {
            return MAPPER.readValue(dbData, new TypeReference<List<PresencaPelada>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
}
