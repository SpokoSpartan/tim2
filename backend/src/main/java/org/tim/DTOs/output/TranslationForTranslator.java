package org.tim.DTOs.output;


import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;

import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.Date;

@Data
@NoArgsConstructor
public class TranslationForTranslator {

	@NotNull
	@NonNull
	private String id;

	@NotNull
	@NonNull
	private String content;

	@NotNull
	@NonNull
	private String locale;

	@NotNull
	@NonNull
	private Date updateDate;

	@NotNull
	@NonNull
	private String messageId;

	private Boolean isValid;

}
