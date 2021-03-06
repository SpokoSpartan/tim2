package org.tim.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.tim.DTOs.*;
import org.tim.DTOs.input.TranslationCreateDTO;
import org.tim.DTOs.output.MessageForTranslator;
import org.tim.DTOs.output.TranslationForTranslator;
import org.tim.configuration.SpringTestsCustomExtension;
import org.tim.entities.Message;
import org.tim.entities.Project;
import org.tim.entities.Translation;
import org.tim.exceptions.ValidationException;

import java.util.List;
import java.util.Locale;

import static io.github.benas.randombeans.api.EnhancedRandom.random;
import static org.junit.jupiter.api.Assertions.*;

public class MessageForTranslatorServiceTestIT extends SpringTestsCustomExtension {

	@Autowired
	private MessageForTranslatorService messageForTranslatorService;

	@Autowired
	private MessageService messageService;

	@Autowired
	private ProjectService projectService;

	@Autowired
	private TranslationService translationService;

	private Project project;

	private final ModelMapper mapper = new ModelMapper();

	@BeforeEach
	void setUp() {
		project = createEmptyGermanToEnglishProjectWithTwoSubstituteLocales();
	}

	@Test
	void whenGettingMessageForTranslatorThenReturnMessagesForTranslator() {
		// given
		MessageDTO messageDTO = random(MessageDTO.class);
		messageDTO.setProjectId(project.getId());
		messageService.createMessage(messageDTO);
		// when
		List<MessageForTranslator> messages = messageForTranslatorService.getMessagesForTranslator(project.getId(), "ab_CD");
		// then
		assertEquals(1, messages.size());
	}

	@Test
	void whenGetMessageForTranslationWithoutLocaleThenReturnMessagesWithoutTranslationAndSubstitute() {
		Long projectId = projectService.getAllProjects().get(0).getId();
		Message message = messageService.createMessage(new MessageDTO("key", "it's message", projectId));
		TranslationCreateDTO translationCreateDTO = new TranslationCreateDTO();
		translationCreateDTO.setLocale(Locale.UK.toString());
		String translationContent = "it's content";
		translationCreateDTO.setContent(translationContent);
		translationService.createTranslation(translationCreateDTO, message.getId());

		List<MessageForTranslator> messageForTranslators = messageForTranslatorService.getMessagesForTranslator(projectId);

		assertAll(
				() -> assertNull(messageForTranslators.get(0).getTranslation()),
				() -> assertNull(messageForTranslators.get(0).getSubstitute())
		);
	}

	@Test
	void whenGetMessageAndTranslationAndSubstituteNotExistThenReturnMessagesWithoutTranslationAndSubstitute() {
		Long projectId = projectService.getAllProjects().get(0).getId();
		Message message = messageService.createMessage(new MessageDTO("key", "it's message", projectId));

		List<MessageForTranslator> messageForTranslators = messageForTranslatorService.getMessagesForTranslator(projectId, Locale.ENGLISH.toString());

		assertAll(
				() -> assertNull(messageForTranslators.get(0).getTranslation()),
				() -> assertNull(messageForTranslators.get(0).getSubstitute())
		);
	}

	@Test
	void whenGetMessageAndTranslationNotExistButSubstituteExistThenReturnOnlySubstitute() {
		Long projectId = projectService.getAllProjects().get(0).getId();
		Message message = messageService.createMessage(new MessageDTO("key", "it's message", projectId));
		TranslationCreateDTO translationCreateDTO = new TranslationCreateDTO();
		translationCreateDTO.setLocale(Locale.UK.toString());
		String translationContent = "it's content";
		translationCreateDTO.setContent(translationContent);
		translationService.createTranslation(translationCreateDTO, message.getId());

		List<MessageForTranslator> messageForTranslators = messageForTranslatorService.getMessagesForTranslator(projectId, Locale.ENGLISH.toString());

		assertAll(
				() -> assertNull(messageForTranslators.get(0).getTranslation()),
				() -> assertEquals(Locale.UK.toString(), messageForTranslators.get(0).getSubstitute().getLocale()),
				() -> assertEquals(translationContent, messageForTranslators.get(0).getSubstitute().getContent()),
				() -> assertEquals("key", messageForTranslators.get(0).getKey())
		);
	}

	@Test
	void whenGetMessageAndTranslationNotExistAndSubstituteExistOnSecondLevelReturnSubstitute() {
		Long projectId = projectService.getAllProjects().get(0).getId();
		Message message = messageService.createMessage(new MessageDTO("key", "it's message", projectId));
		TranslationCreateDTO translationCreateDTO = new TranslationCreateDTO();
		translationCreateDTO.setLocale(Locale.UK.toString());
		String translationContent = "it's content";
		translationCreateDTO.setContent(translationContent);
		translationService.createTranslation(translationCreateDTO, message.getId());
		List<MessageForTranslator> messageForTranslators = messageForTranslatorService.getMessagesForTranslator(projectId, Locale.ENGLISH.toString());

		assertAll(
				() -> assertNull(messageForTranslators.get(0).getTranslation()),
				() -> assertEquals(Locale.UK.toString(), messageForTranslators.get(0).getSubstitute().getLocale()),
				() -> assertEquals(translationContent, messageForTranslators.get(0).getSubstitute().getContent()),
				() -> assertEquals("key", messageForTranslators.get(0).getKey())
		);

	}

	@Test
	void whenGetMessageAndLocaleSetWithWrongFormatThrowValidationException() {
		Long projectId = projectService.getAllProjects().get(0).getId();
		Message message = messageService.createMessage(new MessageDTO("key", "it's message", projectId));
		TranslationCreateDTO translationCreateDTO = new TranslationCreateDTO();
		translationCreateDTO.setLocale(Locale.UK.toString());
		String translationContent = "it's content";
		translationCreateDTO.setContent(translationContent);
		translationService.createTranslation(translationCreateDTO, message.getId());

		Exception exception = assertThrows(ValidationException.class, () ->
				messageForTranslatorService.getMessagesForTranslator(projectId, "wrong_format"));
		assertTrue(exception.getMessage().contains("Source locale: " +
				"wrong_format was given in the wrong format."));
	}

	@Test
	@DisplayName("As a Translator I see previous content of an updated Message.")
	void whenTranslationIsOutdated_thenGetPreviousMessageContent() throws InterruptedException {
		// given
		Long projectId = projectService.getAllProjects().get(0).getId();
		MessageDTO messageDTO = random(MessageDTO.class);
		messageDTO.setProjectId(projectId);
		messageDTO.setContent("Witam");
		Message message = messageService.createMessage(messageDTO);
		TranslationCreateDTO translationCreateDTO = new TranslationCreateDTO("Welcome", "en_US");
		Translation translation = translationService.createTranslation(translationCreateDTO, message.getId());
		MessageForTranslator messageForTranslator = new MessageForTranslator();
		messageForTranslator.setId(message.getId());
		messageForTranslator.setTranslation(mapper.map(translation, TranslationForTranslator.class));

		messageDTO.setContent("Witamy serdecznie");
		messageService.updateMessage(messageDTO, message.getId());

		messageDTO.setContent("Witam użytkownika");
		messageService.updateMessage(messageDTO, message.getId());

		// when
		messageForTranslator.setPreviousMessageContent(messageForTranslatorService.getPreviousMessageContent(messageForTranslator));

		// then
		assertEquals("Witam", messageForTranslator.getPreviousMessageContent());
	}
}
