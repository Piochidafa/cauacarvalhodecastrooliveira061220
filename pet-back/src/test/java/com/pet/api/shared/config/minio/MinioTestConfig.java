package com.pet.api.shared.config.minio;

import io.minio.MinioClient;
import io.minio.messages.Bucket;
import org.mockito.Mockito;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

import java.util.List;

@Configuration
@Profile("test")
public class MinioTestConfig {

    @Bean
    @Primary
    public MinioClient minioClient() throws Exception {
        MinioClient client = Mockito.mock(MinioClient.class);
        Mockito.when(client.bucketExists(Mockito.any())).thenReturn(true);
        Mockito.when(client.listBuckets()).thenReturn(List.of(Mockito.mock(Bucket.class)));
        return client;
    }
}
